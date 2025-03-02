// redux/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  selectedVariant?: string
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, setCartItems } = cartSlice.actions

export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartQuantity = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0)

export default cartSlice.reducer

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { supabase } from "@/utils/supabase";
// import { RootState } from "./store";
// import { Product } from "@/utils/constants";

// export interface CartItem extends Partial<Product> {
//   id: number;
//   quantity: number;
//   selectedVariant?: string;
//   price: number;
// }

// interface CartState {
//   items: CartItem[];
//   totalQuantity: number;
//   totalAmount: number;
// }

// const initialState: CartState = {
//   items: [],
//   totalQuantity: 0,
//   totalAmount: 0,
// };

// // Fetch cart from Supabase
// export const fetchCartFromSupabase = async (dispatch: any) => {
//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user) {
//       const { data, error } = await supabase
//         .from("users_onescoop")
//         .select("cart")
//         .eq("id", user.id)
//         .single();

//       if (!error && data?.cart) {
//         const cartItems: CartItem[] = data.cart;
//         dispatch(setCartItems(cartItems));
//       } else if (error) {
//         console.error("Error fetching cart from Supabase:", error);
//       }
//     } else {
//       console.log("No authenticated user found.");
//     }
//   } catch (error) {
//     console.error("Error in fetchCartFromSupabase:", error);
//   }
// };

// // Update cart in Supabase
// const updateSupabaseCart = async (items: CartItem[]) => {
//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (user) {
//       const { error } = await supabase
//         .from("users_onescoop")
//         .update({ cart: items })
//         .eq("id", user.id);

//       if (error) {
//         console.error("Error updating Supabase cart:", error);
//       } else {
//         console.log("Cart updated in Supabase successfully.");
//       }
//     } else {
//       console.log("No authenticated user found. Cart not updated in Supabase.");
//     }
//   } catch (error) {
//     console.error("Error in updateSupabaseCart:", error);
//   }
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCartItems: (state, action: PayloadAction<CartItem[]>) => {
//       state.items = action.payload;
//       state.totalQuantity = action.payload.reduce((total, item) => total + item.quantity, 0);
//       state.totalAmount = action.payload.reduce((total, item) => total + item.price * item.quantity, 0);
//     },
//     addToCart: (state, action: PayloadAction<CartItem>) => {
//       const { id, quantity = 1 } = action.payload;
//       const existingItemIndex = state.items.findIndex((item) => item.id === id);

//       if (existingItemIndex > -1) {
//         state.items[existingItemIndex].quantity += quantity;
//       } else {
//         state.items.push({ ...action.payload, quantity });
//       }

//       state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
//       state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

//       // Update Supabase cart
//       updateSupabaseCart(state.items);
//     },
//     updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
//       const { id, quantity } = action.payload;
//       const itemIndex = state.items.findIndex((item) => item.id === id);

//       if (itemIndex > -1) {
//         if (quantity <= 0) {
//           state.items.splice(itemIndex, 1);
//         } else {
//           state.items[itemIndex].quantity = quantity;
//         }

//         state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
//         state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

//         // Update Supabase cart
//         updateSupabaseCart(state.items);
//       }
//     },
//     removeFromCart: (state, action: PayloadAction<number>) => {
//       state.items = state.items.filter((item) => item.id !== action.payload);
//       state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
//       state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

//       // Update Supabase cart
//       updateSupabaseCart(state.items);
//     },
//     clearCart: (state) => {
//       state.items = [];
//       state.totalQuantity = 0;
//       state.totalAmount = 0;

//       // Update Supabase cart
//       updateSupabaseCart([]);
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems } = cartSlice.actions;
// export const selectCartItems = (state: RootState) => state.cart.items;
// export const selectCartTotal = (state: RootState) => state.cart.totalAmount;
// export const selectCartQuantity = (state: RootState) => state.cart.totalQuantity;
// export const isItemInCart = (state: RootState, itemId: number) =>
//   state.cart.items.some((item) => item.id === itemId);

// export default cartSlice.reducer;