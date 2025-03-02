export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    selectedVariant?: string;
    image?: string;
  }