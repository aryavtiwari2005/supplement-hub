// src/types/orders.ts
export interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariant?: string; // Optional
}

export interface Address {
  city: string;
  state: string;
  street: string;
  zipCode: string;
}

export interface Order {
  order_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  user_id?: number; // Optional as it might not always be present
  user_email?: string; // Optional to match your error
  address: Address;
  discount: number;
  subtotal: number;
  coupon_code: string | null;
  payment_method: string;
  transaction_id: string;
}
