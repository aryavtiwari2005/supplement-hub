export interface Order {
  order_id: string;
  items: Array<{
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  subtotal: number;
  discount: number;
  status: string;
  created_at: string;
  user_id?: number;
  user_email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  coupon_code?: string | null;
  payment_method: string;
  transaction_id?: string;
}
