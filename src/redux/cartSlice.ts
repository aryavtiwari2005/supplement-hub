import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  paymentMethod?: "phonePe" | "cod"; // Add paymentMethod to state
}

const initialState: CartState = {
  items: [],
  paymentMethod: undefined, // Initialize as undefined
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== item.id);
        }
      }
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    setPaymentMethod: (
      state,
      action: PayloadAction<"phonePe" | "cod" | undefined>
    ) => {
      state.paymentMethod = action.payload; // Add reducer to set payment method
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setCartItems,
  setPaymentMethod, // Export new action
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartQuantity = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
export const selectCartTotal = (
  state: { cart: CartState },
  couponDiscount: number = 0,
  scoopPointsToRedeem: number = 0
) => {
  const subtotal = selectCartSubtotal(state);
  const phonePeDiscount =
    state.cart.paymentMethod === "phonePe" ? subtotal * 0.03 : 0; // 3% discount for PhonePe
  const totalDiscount = couponDiscount + scoopPointsToRedeem + phonePeDiscount;
  return Math.max(0, subtotal - totalDiscount);
};

export default cartSlice.reducer;
