// All shared types live here — one place to check when the backend's
// shape changes, instead of hunting through component files.

// Matches backend-go-fixed's repo.Product exactly.
export type Product = {
  id: number;
  title: string;
  description: string;
  price: number; // whole currency units (BDT), not cents
  discount_price?: number; // when present, this is the real price
  stock: number;
  sizes: string[];
  category_id?: number;
  imageUrl: string;
};

// Matches backend-go-fixed's repo.Category.
export type Category = {
  id: number;
  name: string;
  slug: string;
};

// Matches repo.User as returned by the backend (Password is tagged
// json:"-" server-side, so it never appears here).
export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_shop_owner: boolean;
};

// Matches repo.User exactly (Password is tagged json:"-" server-side, so
// it never appears here). Used for the admin user list — AuthUser above
// is intentionally the smaller session-only shape.
export type User = AuthUser & {
  created_at: string;
  updated_at: string;
};

// Matches user.LoginResponse.
export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

export type SignupInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// A line in the cart — not a backend type, since there's no cart concept
// server-side. Lives entirely client-side (see lib/store/cart-store.ts).
export type CartLine = {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  size: string; // "one-size" when the product has no size variants
  quantity: number;
};

// Matches repo.Order / repo.OrderItem exactly.
export type OrderItem = {
  product_id: number;
  product_title: string;
  unit_price: number;
  quantity: number;
  size: string;
};

export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type Order = {
  id: number;
  user_id: number;
  status: OrderStatus;
  shipping_address: string;
  shipping_phone: string;
  recipient_name: string;
  recipient_email?: string;
  delivery_city: string;
  delivery_area: string;
  delivery_postal_code?: string;
  delivery_landmark?: string;
  delivery_instructions?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type CheckoutInput = {
  items: { product_id: number; quantity: number; size: string }[];
  shipping_address: string;
  shipping_phone: string;
  recipient_name: string;
  recipient_email?: string;
  delivery_city: string;
  delivery_area: string;
  delivery_postal_code?: string;
  delivery_landmark?: string;
  delivery_instructions?: string;
};

// Matches repo.Banner exactly.
export type Banner = {
  id: number;
  title: string;
  subtitle: string;
  discount_text: string;
  image_url: string;
  link_url: string;
  category_id?: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
};

export type BannerInput = {
  title: string;
  subtitle: string;
  discount_text: string;
  image_url: string;
  link_url: string;
  category_id: number | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};
