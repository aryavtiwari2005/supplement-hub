// /pages/api/create-razorpay-order.ts
import Razorpay from 'razorpay';
import { NextApiRequest, NextApiResponse } from 'next';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cartItems, userId } = req.body;

  try {
    // Calculate the total amount in paise (Razorpay requires amount in the smallest currency unit)
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) * 100;

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount, // Amount in paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`, // Unique receipt ID
      payment_capture: true, // Auto-capture payment
    });

    res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}