// services/orderService.ts
import { supabase } from "@/utils/supabase";

export const orderService = {
  async updateOrderStatus(userId: number, orderId: string, newStatus: string) {
    // Get current orders
    const { data: userData, error: fetchError } = await supabase
      .from("users_onescoop")
      .select("orders")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    // Find and update the specific order
    const updatedOrders = userData.orders.map((order: any) =>
      order.order_id === orderId ? { ...order, status: newStatus } : order
    );

    // Update user record
    const { error: updateError } = await supabase
      .from("users_onescoop")
      .update({ orders: updatedOrders })
      .eq("id", userId);

    if (updateError) throw updateError;
    return { success: true };
  },

  async getOrder(userId: number, orderId: string) {
    const { data: userData, error } = await supabase
      .from("users_onescoop")
      .select("orders")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return userData.orders.find((order: any) => order.order_id === orderId);
  },
};
