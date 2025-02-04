import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/utils/constants"; // Assuming you have a Product interface
import { RootState } from "./store";

export interface CartItem extends Partial<Product> {
  id: number;
  quantity: number;
  selectedVariant?: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add to cart with more robust handling
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex((item) => item.id === id);

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };

        state.items = updatedItems;
      } else {
        // Add new item
        state.items.push({
          ...action.payload,
          quantity: quantity,
        });
      }

      // Recalculate totals
      state.totalQuantity = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{
        id: number; // Change the id type to number
        quantity: number;
      }>
    ) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === id);

      if (itemIndex > -1) {
        const updatedItems = [...state.items];
        const item = updatedItems[itemIndex];

        // Remove item if quantity is 0
        if (quantity <= 0) {
          updatedItems.splice(itemIndex, 1);
        } else {
          updatedItems[itemIndex] = {
            ...item,
            quantity,
          };
        }

        state.items = updatedItems;

        // Recalculate totals
        state.totalQuantity = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      }
    },

    // Remove specific item from cart
    removeFromCart: (state, action: PayloadAction<number>) => {
      // Change the id type to number
      const itemToRemove = state.items.find(
        (item) => item.id === action.payload
      );

      if (itemToRemove) {
        state.items = state.items.filter((item) => item.id !== action.payload);

        // Recalculate totals
        state.totalQuantity = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

// Selectors for easy access to cart state
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.totalAmount;
export const selectCartQuantity = (state: RootState) =>
  state.cart.totalQuantity;

// Check if item is in cart
export const isItemInCart = (
  state: RootState,
  itemId: number // Change the id type to number
) => state.cart.items.some((item) => item.id === itemId);

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
