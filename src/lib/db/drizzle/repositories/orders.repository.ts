import { eq, desc, sql, and, count } from "drizzle-orm";
import { db } from "../connection";
import {
  orderItems,
  orderProducts,
  customerInfo,
  productsVariants,
  productsItems,
} from "../schema";
import type {
  OrderWithDetails,
  CreateOrderItemInput,
  InsertOrderProduct,
  InsertCustomerInfo,
  OrderStatus,
} from "@/lib/db/drizzle/schema";

export interface AdminOrdersFilter {
  status?: OrderStatus;
  wilaya?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminOrdersResult {
  orders: OrderWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminDashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  deliveredRevenueCents: number;
  statusCounts: Record<OrderStatus, number>;
  recentOrders: OrderWithDetails[];
}

const ORDER_NUMBER_LOCK_NAMESPACE = 42_001;
const ORDER_NUMBER_LOCK_RESOURCE = 1;
const MAX_CREATE_COMPLETE_ATTEMPTS = 3;
const UNIQUE_VIOLATION_CODE = "23505";

export const ordersRepository = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const [aggregate, statuses, recent] = await Promise.all([
      db
        .select({
          totalOrders: count(),
          pendingOrders: sql<number>`count(*) filter (where ${orderItems.status} = 'pending')`,
          deliveredRevenueCents: sql<number>`coalesce(sum(case when ${orderItems.status} = 'delivered' then ${customerInfo.totalPrice} else 0 end), 0)`,
        })
        .from(orderItems)
        .leftJoin(customerInfo, eq(customerInfo.orderId, orderItems.id)),
      db
        .select({ status: orderItems.status, total: count() })
        .from(orderItems)
        .groupBy(orderItems.status),
      db.query.orderItems.findMany({
        with: ORDER_WITH_DETAILS,
        orderBy: [desc(orderItems.createdAt)],
        limit: 5,
      }),
    ]);
    const statusCounts = Object.fromEntries(
      ["pending", "confirmed", "no_answer", "out_for_delivery", "delivered", "cancelled", "returned"].map((status) => [status, 0]),
    ) as Record<OrderStatus, number>;
    statuses.forEach(({ status, total }) => { statusCounts[status] = Number(total); });
    return {
      totalOrders: Number(aggregate[0]?.totalOrders ?? 0),
      pendingOrders: Number(aggregate[0]?.pendingOrders ?? 0),
      deliveredRevenueCents: Number(aggregate[0]?.deliveredRevenueCents ?? 0),
      statusCounts,
      recentOrders: recent.map(transformOrderWithDetails),
    };
  },

  async findAllForAdmin(
    filter: AdminOrdersFilter = {},
  ): Promise<AdminOrdersResult> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSize =
      filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;

    const conditions = [];
    if (filter.status) {
      conditions.push(eq(orderItems.status, filter.status));
    }
    if (filter.wilaya) {
      conditions.push(
        sql`exists (
          select 1 from customer_info
          where customer_info.order_id = ${orderItems.id}
            and customer_info.address ->> 'wilaya' = ${filter.wilaya}
        )`,
      );
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [rows, totalRows] = await Promise.all([
      db.query.orderItems.findMany({
        where: whereClause,
        with: ORDER_WITH_DETAILS,
        orderBy: [desc(orderItems.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      db.select({ total: count() }).from(orderItems).where(whereClause),
    ]);

    return {
      orders: rows.map(transformOrderWithDetails),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    };
  },

  async updateStatus(
    id: number,
    status: OrderStatus,
  ): Promise<OrderWithDetails | null> {
    const [updated] = await db
      .update(orderItems)
      .set({ status, updatedAt: new Date() })
      .where(eq(orderItems.id, id))
      .returning({ id: orderItems.id });

    if (!updated) return null;
    return this.findById(updated.id);
  },

  async countPriorIssuesByPhone(
    phone: string | null,
    excludeOrderId: number,
  ): Promise<number> {
    if (!phone) return 0;

    const [row] = await db
      .select({ total: count() })
      .from(orderItems)
      .innerJoin(customerInfo, eq(customerInfo.orderId, orderItems.id))
      .where(
        and(
          eq(customerInfo.phone, phone),
          sql`${orderItems.id} != ${excludeOrderId}`,
          sql`${orderItems.status} in ('cancelled', 'no_answer')`,
        ),
      );

    return Number(row?.total ?? 0);
  },

  async findByOrderRef(
    orderRef: string,
  ): Promise<OrderWithDetails | null> {
    const customer = await db.query.customerInfo.findFirst({
      where: eq(customerInfo.orderRef, orderRef),
    });

    if (!customer) return null;

    return this.findById(customer.orderId);
  },

  async findByUserId(userId: string): Promise<OrderWithDetails[]> {
    const orders = await db.query.orderItems.findMany({
      where: eq(orderItems.userId, userId),
      with: ORDER_WITH_DETAILS,
      orderBy: [desc(orderItems.createdAt)],
    });
    return orders.map(transformOrderWithDetails);
  },

  async findById(id: number): Promise<OrderWithDetails | null> {
    const order = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, id),
      with: ORDER_WITH_DETAILS,
    });

    return order ? transformOrderWithDetails(order) : null;
  },

  async findByOrderNumber(
    orderNumber: number,
  ): Promise<OrderWithDetails | null> {
    const order = await db.query.orderItems.findFirst({
      where: eq(orderItems.orderNumber, orderNumber),
      with: ORDER_WITH_DETAILS,
    });

    return order ? transformOrderWithDetails(order) : null;
  },

  async findByOrderNumberAndRef(
    orderNumber: number,
    orderRef: string,
  ): Promise<OrderWithDetails | null> {
    const order = await this.findByOrderNumber(orderNumber);
    return order?.customerInfo?.orderRef === orderRef ? order : null;
  },

  async createComplete(
    orderData: CreateOrderItemInput,
    customerData: Omit<InsertCustomerInfo, "orderId">,
    products: Omit<InsertOrderProduct, "orderId">[],
  ): Promise<OrderWithDetails | null> {
    const existingOrder = await this.findByOrderRef(
      customerData.orderRef,
    );
    if (existingOrder) {
      return existingOrder;
    }

    for (let attempt = 0; attempt < MAX_CREATE_COMPLETE_ATTEMPTS; attempt += 1) {
      try {
        return await db.transaction(async (tx) => {
          await tx.execute(
            sql`select pg_advisory_xact_lock(${ORDER_NUMBER_LOCK_NAMESPACE}, ${ORDER_NUMBER_LOCK_RESOURCE})`,
          );

          const [lastOrder] = await tx
            .select({ orderNumber: orderItems.orderNumber })
            .from(orderItems)
            .orderBy(desc(orderItems.orderNumber))
            .limit(1);

          const [newOrder] = await tx
            .insert(orderItems)
            .values({
              userId: orderData.userId,
              deliveryDate: orderData.deliveryDate,
              orderNumber: (lastOrder?.orderNumber ?? 0) + 1,
            })
            .returning();

          if (!newOrder) return null;

          await tx.insert(customerInfo).values({
            orderId: newOrder.id,
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            orderRef: customerData.orderRef,
            totalPrice: customerData.totalPrice,
          });

          await tx.insert(orderProducts).values(
            products.map((product) => ({
              orderId: newOrder.id,
              variantId: product.variantId,
              quantity: product.quantity,
              size: product.size,
            })),
          );

          const createdOrder = await tx.query.orderItems.findFirst({
            where: eq(orderItems.id, newOrder.id),
            with: ORDER_WITH_DETAILS,
          });

          return createdOrder ? transformOrderWithDetails(createdOrder) : null;
        });
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }

        const concurrentOrder = await this.findByOrderRef(
          customerData.orderRef,
        );
        if (concurrentOrder) {
          return concurrentOrder;
        }

        if (attempt === MAX_CREATE_COMPLETE_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    return null;
  },
};

function isUniqueViolation(
  error: unknown,
): error is {
  code: string;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_VIOLATION_CODE
  );
}

const ORDER_WITH_DETAILS = {
  customerInfo: true,
  orderProducts: {
    with: {
      variant: {
        with: {
          product: true,
        },
      },
    },
  },
} as const;

function transformOrderWithDetails(row: {
  id: number;
  userId: string | null;
  deliveryDate: Date;
  orderNumber: number;
  status: OrderStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  customerInfo: typeof customerInfo.$inferSelect | null;
  orderProducts: Array<{
    id: number;
    orderId: number;
    variantId: number;
    quantity: number;
    size: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    variant: typeof productsVariants.$inferSelect & {
      product: typeof productsItems.$inferSelect;
    };
  }>;
}): OrderWithDetails {
  return {
    id: row.id,
    userId: row.userId,
    deliveryDate: row.deliveryDate.toISOString(),
    orderNumber: row.orderNumber,
    status: row.status,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    customerInfo: row.customerInfo
      ? {
          id: row.customerInfo.id,
          orderId: row.customerInfo.orderId,
          name: row.customerInfo.name,
          email: row.customerInfo.email,
          phone: row.customerInfo.phone,
          address: row.customerInfo.address,
          orderRef: row.customerInfo.orderRef,
          totalPrice: row.customerInfo.totalPrice,
          createdAt:
            row.customerInfo.createdAt?.toISOString() ??
            new Date().toISOString(),
          updatedAt:
            row.customerInfo.updatedAt?.toISOString() ??
            new Date().toISOString(),
        }
      : {
          id: 0,
          orderId: row.id,
          name: "",
          email: "",
          phone: null,
          address: { line1: "", city: "", wilaya: "", country: "Algeria" as const },
          orderRef: "",
          totalPrice: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
    orderProducts: row.orderProducts.map((op) => ({
      id: op.id,
      orderId: op.orderId,
      variantId: op.variantId,
      quantity: op.quantity,
      size: op.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
      createdAt: op.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: op.updatedAt?.toISOString() ?? new Date().toISOString(),
      variant: {
        id: op.variant.id,
        productId: op.variant.productId,
        color: op.variant.color,
        sizes: op.variant.sizes,
        images: op.variant.images,
        createdAt:
          op.variant.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt:
          op.variant.updatedAt?.toISOString() ?? new Date().toISOString(),
        product: {
          id: op.variant.product.id,
          name: op.variant.product.name,
          description: op.variant.product.description,
          price: Number(op.variant.product.price),
          category: op.variant.product.category,
          img: op.variant.product.img,
          isFeatured: op.variant.product.isFeatured,
          createdAt:
            op.variant.product.createdAt?.toISOString() ??
            new Date().toISOString(),
          updatedAt:
            op.variant.product.updatedAt?.toISOString() ??
            new Date().toISOString(),
        },
      },
    })),
  };
}
