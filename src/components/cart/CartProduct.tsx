import Link from "next/link";
import type { CartItem, Product, ProductVariant } from "@/lib/db/drizzle/schema";
import { ProductImage } from "../products/ProductImage";
import { DeleteButton } from "./DeleteButton";
import { ProductCartInfo } from "./ProductCartInfo";
export function CartProduct({ product, cartItemId, quantity, variant }: { product: Product; cartItemId: CartItem["id"]; quantity: number; variant: ProductVariant }) { const link = `/${product.category}/${product.id}?variant=${variant.id}`; return <div className="flex flex-col overflow-hidden rounded-md border"><Link href={link}><ProductImage image={variant.images[0]} name={product.name} width={280} height={425} sizes="100vw" /></Link><div className="flex flex-col gap-2.5 bg-background-secondary p-3.5"><div className="flex justify-between"><Link href={link}><h2 className="truncate text-sm font-semibold">{product.name}</h2></Link><DeleteButton cartItemId={cartItemId} /></div><div className="text-sm">{variant.price.toLocaleString("ar-DZ")} دج</div><ProductCartInfo cartItemId={cartItemId} quantity={quantity} variant={variant} /></div></div>; }
