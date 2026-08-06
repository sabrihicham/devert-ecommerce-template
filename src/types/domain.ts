// Business logic types (view models)

export interface Order {
  id: number;
  userId?: string;
  orderNumber: number;
  items: OrderLineItem[];
  customer: CustomerDetails;
  total: number;
  status: OrderStatus;
  deliveryDate: string;
  createdAt: string;
}

export interface OrderLineItem {
  productId: number;
  variantId: number;
  quantity: number;
  variantSnapshot: { flavor: string; form: string; quantity: number; quantityUnit: string; sku: string; price: number };
  price: number;
  flavor: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone?: string;
  address: DomainAddress;
}

export interface DomainAddress {
  line1?: string;
  line2?: string;
  city?: string;
  wilaya?: string;
  country?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Cart {
  items: CartLineItem[];
  total: number;
  subtotal: number;
  tax: number;
}

export interface CartLineItem {
  productId: number;
  variantId: number;
  quantity: number;
  price: number;
  name: string;
  flavor: string;
}

export interface DomainProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  variants: DomainProductVariant[];
}

export interface DomainProductVariant {
  id: number;
  flavor: string;
  form: string;
  quantity: number;
  quantityUnit: string;
  images: string[];
}
