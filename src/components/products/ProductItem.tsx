/** COMPONENTS */
import { ProductImage } from "./ProductImage";
import Link from "next/link";
/** FUNCTIONALITY */
import dynamic from "next/dynamic";
/** TYPES */
import type { ProductWithVariants } from "@/lib/db/drizzle/schema";

const WishlistButton = dynamic(() => import("../wishlist/WishlistButton"));

interface ProductItemProps {
  product: ProductWithVariants;
}

export const ProductItem = ({ product }: ProductItemProps) => {
  const { name, id, img, price, category, variants } = product;

  const productLink = `/${category}/${id}?variant=${variants[0].color}`;

  return (
    <div className="group flex flex-col justify-between border border-solid border-border-primary rounded-md overflow-hidden transition-colors duration-300 hover:border-border-secondary/60">
      <Link href={productLink} className="block overflow-hidden">
        <ProductImage
          image={img}
          name={name}
          width={280}
          height={425}
          sizes="(max-width: 640px) 100vw, (max-width: 1154px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>
      <div className="flex justify-between flex-col gap-2.5 p-3.5 bg-background-secondary z-10">
        <div className="flex justify-between w-full">
          <Link href={productLink} className="w-10/12">
            <h2 className="text-sm font-semibold truncate transition-colors duration-300 group-hover:text-color-tertiary">
              {name}
            </h2>
          </Link>

          <WishlistButton productId={id} />
        </div>
        <div className="text-sm">{price.toFixed(2)} €</div>
      </div>
    </div>
  );
};
