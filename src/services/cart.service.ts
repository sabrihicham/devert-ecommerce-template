import { cartRepository } from "@/lib/db/drizzle/repositories";
import type {
  CartItem,
  CartItemWithDetails,
  AddToCartInput,
} from "@/lib/db/drizzle/schema";
import { getLocalizedArray, getLocalizedText, type Locale } from "@/lib/i18n";

export async function getCart(userId: string): Promise<CartItem[]> {
  try {
    return await cartRepository.findByUserId(userId);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

export async function getCartWithDetails(
  userId: string,
  locale: Locale = "ar",
): Promise<CartItemWithDetails[]> {
  try {
    const items = await cartRepository.findByUserIdWithDetails(userId);
    return items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        name: getLocalizedText({ locale, ar: item.product.name, fr: item.product.nameFr }),
        description: getLocalizedText({ locale, ar: item.product.description, fr: item.product.descriptionFr }),
        ingredients: getLocalizedText({ locale, ar: item.product.ingredients, fr: item.product.ingredientsFr }),
        usage: getLocalizedText({ locale, ar: item.product.usage, fr: item.product.usageFr }),
        warnings: getLocalizedText({ locale, ar: item.product.warnings, fr: item.product.warningsFr }),
        tags: getLocalizedArray({ locale, ar: item.product.tags, fr: item.product.tagsFr }),
      },
      variant: {
        ...item.variant,
        flavor: getLocalizedText({ locale, ar: item.variant.flavor, fr: item.variant.flavorFr }),
      },
    }));
  } catch (error) {
    console.error("Error fetching cart with details:", error);
    return [];
  }
}

export async function addToCart(
  userId: string,
  cartItem: AddToCartInput,
): Promise<CartItem | null> {
  try {
    return await cartRepository.upsert({
      ...cartItem,
      userId,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

export async function removeFromCart(
  userId: string,
  cartItemId: number,
): Promise<boolean> {
  try {
    return await cartRepository.delete(userId, cartItemId);
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}

export async function updateCartItem(
  userId: string,
  cartItemId: number,
  quantity: number,
): Promise<CartItem | null> {
  try {
    return await cartRepository.updateQuantity(userId, cartItemId, quantity);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return null;
  }
}

export async function clearCart(userId: string): Promise<boolean> {
  try {
    return await cartRepository.clearByUserId(userId);
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
}

export async function findCartItem(
  userId: string,
  variantId: number,
): Promise<CartItem | null> {
  try {
    return await cartRepository.findOne(userId, variantId);
  } catch (error) {
    console.error("Error finding cart item:", error);
    return null;
  }
}
