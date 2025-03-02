import { supabase } from '@/utils/supabase'
import { CartItem } from '@/types'

export const cartService = {
  async getUserCart(userId: string): Promise<CartItem[]> {
    if (!userId) {
      console.error('getUserCart called with empty userId')
      throw new Error('Invalid user ID')
    }
    
    const { data, error } = await supabase
      .from('users_onescoop')
      .select('cart')
      .eq('id', userId)
      .single()
      
    if (error) throw error
    return data?.cart || []
  },
  
  async addToCart(userId: string, item: CartItem): Promise<void> {
    if (!userId) {
      console.error('addToCart called with empty userId')
      throw new Error('Invalid user ID')
    }
    
    // First get current cart
    const currentCart = await this.getUserCart(userId)
   
    // Check if item exists
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id)
   
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      currentCart[existingItemIndex].quantity += item.quantity
    } else {
      // Add new item
      currentCart.push(item)
    }
    
    const { error } = await supabase
      .from('users_onescoop')
      .update({ cart: currentCart })
      .eq('id', userId)
      
    if (error) throw error
  },
  
  async removeFromCart(userId: string, productId: number): Promise<void> {
    if (!userId) {
      console.error('removeFromCart called with empty userId')
      throw new Error('Invalid user ID')
    }
    
    const currentCart = await this.getUserCart(userId)
    const updatedCart = currentCart.filter(item => item.id !== productId)
    
    const { error } = await supabase
      .from('users_onescoop')
      .update({ cart: updatedCart })
      .eq('id', userId)
      
    if (error) throw error
  },
  
  async updateCartQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    if (!userId) {
      console.error('updateCartQuantity called with empty userId')
      throw new Error('Invalid user ID')
    }
    
    const currentCart = await this.getUserCart(userId)
    const updatedCart = currentCart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
    
    const { error } = await supabase
      .from('users_onescoop')
      .update({ cart: updatedCart })
      .eq('id', userId)
      
    if (error) throw error
  },
  
  async checkout(userId: string, cartItems: CartItem[]): Promise<void> {
    if (!userId) {
      console.error('checkout called with empty userId')
      throw new Error('Invalid user ID')
    }
    
    if (!cartItems.length) {
      throw new Error("Cart is empty")
    }
    
    // 1. Update the cart in the database
    const { error: cartUpdateError } = await supabase
      .from('users_onescoop')
      .update({ cart: cartItems })
      .eq('id', userId)
    
    if (cartUpdateError) throw cartUpdateError
    
    // 2. Create an order record
    try {
      const orderDetails = {
        user_id: userId,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'pending',
        created_at: new Date()
      }
      
      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderDetails)
      
      if (orderError) throw orderError
      
    } catch (error) {
      console.error('Error creating order record:', error)
      // You might want to handle this error differently
      // For now, we'll continue with the checkout process
    }
    
    // 3. Clear the cart after successful checkout (optional)
    // Uncomment if you want to clear the cart after checkout
    /*
    const { error: clearCartError } = await supabase
      .from('users_onescoop')
      .update({ cart: [] })
      .eq('id', userId)
      
    if (clearCartError) throw clearCartError
    */
  }
}