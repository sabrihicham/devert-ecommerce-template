import { Skeleton } from "@/components/ui/skeleton";

interface ProductsSkeletonProps {
  extraClassname?: string;
  items: number;
}

export const ProductsSkeleton = ({
  extraClassname,
  items,
}: ProductsSkeletonProps) => {
  const productSkeletons = Array.from({ length: items }, (_, index) => (
    <div
      key={index}
      className={`flex justify-between border border-solid border-border-primary rounded-xl overflow-hidden bg-background-secondary
            ${
              extraClassname === "cart-ord-mobile"
                ? "flex-row sm:flex-col"
                : "flex-col"
            }`}
    >
      <Skeleton className="w-full aspect-[2/3] rounded-b-none" />
      <div className="flex justify-between flex-col gap-2.5 p-3.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ));

  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 lg:grid-cols-4 ${
        extraClassname === "colums-mobile" ? "grid-cols-auto-fill-110" : ""
      }
        ${
          extraClassname === "cart-ord-mobile" ? "grid-cols-1" : ""
        }`}
    >
      {productSkeletons}
    </div>
  );
};

export default ProductsSkeleton;
