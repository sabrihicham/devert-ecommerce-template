// Route constants

export const routes = {
  // Public routes
  home: "/",
  login: "/(auth)/login",
  register: "/(auth)/register",
  
  // Store routes
  products: "/(store)/products",
  search: "/(store)/search",
  category: (cat: string) => `/(store)/${cat}`,
  productDetail: (id: string | number) => `/(store)/[category]/${id}`,
  
  // User routes
  cart: "/(user)/cart",
  checkout: "/(user)/checkout",
  createProduct: "/admin/products/create",
  
  // API routes
  api: {
    auth: "/api/v1/auth",
    cart: "/api/v1/cart",
    wishlist: "/api/v1/wishlist",
    orders: "/api/v1/orders",
    products: "/api/v1/products",
    users: "/api/v1/users",
    search: "/api/v1/search",
  },
};

export type Routes = typeof routes;

