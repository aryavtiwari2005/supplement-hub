// 'use client'

// import { useSelector, useDispatch } from 'react-redux'
// import { selectCartItems, removeFromCart, updateQuantity, setCartItems } from '@/redux/cartSlice'
// import { cartService } from '@/services/cartService'
// import { useEffect, useState } from 'react'
// import { X } from 'lucide-react'
// import Link from 'next/link'
// import { FC } from 'react'
// import { useRouter } from 'next/navigation'

// // Define the THEMES object
// const THEMES = {
//   light: {
//     background: {
//       primary: "bg-white",
//       secondary: "bg-yellow-50",
//     },
//     text: {
//       primary: "text-black",
//       secondary: "text-gray-700",
//       muted: "text-gray-500",
//     },
//     border: "border-gray-200",
//     dropdown: {
//       background: "bg-yellow-50",
//       text: "text-gray-800",
//       hover: "hover:bg-yellow-100",
//     },
//   },
//   dark: {
//     background: {
//       primary: "bg-black",
//       secondary: "bg-gray-900",
//     },
//     text: {
//       primary: "text-white",
//       secondary: "text-gray-300",
//       muted: "text-gray-500",
//     },
//     border: "border-gray-800",
//     dropdown: {
//       background: "bg-gray-900",
//       text: "text-gray-300",
//       hover: "hover:bg-gray-800",
//     },
//   },
// };

// // Define props interface
// interface CartPageProps {
//   userId: string;
// }

// // Use FC type with explicit props typing
// const CartPage: FC<CartPageProps> = ({ userId }) => {
//   const [theme] = useState<'light' | 'dark'>('light')
//   const dispatch = useDispatch()
//   const cartItems = useSelector(selectCartItems)
//   const [isCheckingOut, setIsCheckingOut] = useState(false)
//   const [errorMessage, setErrorMessage] = useState('')
//   const [successMessage, setSuccessMessage] = useState('')
//   const router = useRouter()

//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const cart = await cartService.getUserCart(userId)
//         dispatch(setCartItems(cart || []))
//       } catch (error) {
//         console.error('Error fetching cart:', error)
//         setErrorMessage('Failed to load your cart. Please refresh the page.')
//       }
//     }
//     fetchCart()
//   }, [dispatch, userId])

//   const handleRemoveItem = async (id: number) => {
//     try {
//       dispatch(removeFromCart(id))
//       await cartService.removeFromCart(userId, id)
//     } catch (error) {
//       console.error('Error removing item:', error)
//       setErrorMessage('Failed to remove item. Please try again.')
//     }
//   }

//   const handleQuantityChange = async (id: number, quantity: number) => {
//     try {
//       dispatch(updateQuantity({ id, quantity }))
//       await cartService.updateCartQuantity(userId, id, quantity)
//     } catch (error) {
//       console.error('Error updating quantity:', error)
//       setErrorMessage('Failed to update quantity. Please try again.')
//     }
//   }

//   const handleCheckout = async () => {
//     if (!cartItems.length) {
//       setErrorMessage("Your cart is empty!");
//       return;
//     }

//     setIsCheckingOut(true);
//     setErrorMessage('');
//     setSuccessMessage('');
    
//     try {
//       // Use the new checkout method from cartService
//       await cartService.checkout(userId, cartItems);
      
//       setSuccessMessage('Checkout successful!');
      
//       // Optional: Clear cart in Redux after checkout
//       // dispatch(setCartItems([]));
      
//       // Optional: Redirect to a success page
//       // setTimeout(() => router.push('/checkout/success'), 2000);
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       setErrorMessage('Checkout failed. Please try again.');
//     } finally {
//       setIsCheckingOut(false);
//     }
//   }

//   const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

//   return (
//     <div className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}>
//       <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
//         Shopping Cart
//       </h1>
      
//       {errorMessage && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {errorMessage}
//         </div>
//       )}
      
//       {successMessage && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {successMessage}
//         </div>
//       )}
      
//       {cartItems.length === 0 ? (
//         <div className={`text-center py-8 ${THEMES[theme].text.muted}`}>
//           <p>Your cart is empty</p>
//           <Link href="/products" className="text-yellow-500 hover:text-yellow-600">
//             Continue Shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {cartItems.map((item) => (
//             <div 
//               key={item.id} 
//               className={`flex items-center justify-between ${THEMES[theme].border} border-b py-4`}
//             >
//               <div className="flex-1">
//                 <h3 className={`font-semibold ${THEMES[theme].text.primary}`}>
//                   {item.name}
//                 </h3>
//                 <p className={THEMES[theme].text.primary}>
//                   ${item.price.toFixed(2)}
//                 </p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <select
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
//                   className={`p-1 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary}`}
//                 >
//                   {[...Array(10)].map((_, i) => (
//                     <option key={i + 1} value={i + 1}>
//                       {i + 1}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() => handleRemoveItem(item.id)}
//                   className="text-red-500 hover:text-red-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           ))}
          
//           <div className="text-right">
//             <p className={`text-xl font-bold ${THEMES[theme].text.primary}`}>
//               Total: ${total.toFixed(2)}
//             </p>
//             <button 
//               onClick={handleCheckout}
//               disabled={isCheckingOut}
//               className={`mt-4 px-6 py-2 rounded ${
//                 theme === 'light' 
//                   ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
//                   : 'bg-yellow-600 text-white hover:bg-yellow-700'
//               } ${isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default CartPage


'use client';

import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, removeFromCart, updateQuantity, setCartItems } from '@/redux/cartSlice';
import { cartService } from '@/services/cartService';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { useRouter } from 'next/navigation';

// Define the THEMES object
const THEMES = {
  light: {
    background: {
      primary: 'bg-white',
      secondary: 'bg-yellow-50',
    },
    text: {
      primary: 'text-black',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
    },
    border: 'border-gray-200',
    dropdown: {
      background: 'bg-yellow-50',
      text: 'text-gray-800',
      hover: 'hover:bg-yellow-100',
    },
  },
  dark: {
    background: {
      primary: 'bg-black',
      secondary: 'bg-gray-900',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-500',
    },
    border: 'border-gray-800',
    dropdown: {
      background: 'bg-gray-900',
      text: 'text-gray-300',
      hover: 'hover:bg-gray-800',
    },
  },
};

// Define props interface
interface CartPageProps {
  userId: string;
}

// Use FC type with explicit props typing
const CartPage: FC<CartPageProps> = ({ userId }) => {
  const [theme] = useState<'light' | 'dark'>('light');
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await cartService.getUserCart(userId);
        dispatch(setCartItems(cart || []));
      } catch (error) {
        console.error('Error fetching cart:', error);
        setErrorMessage('Failed to load your cart. Please refresh the page.');
      }
    };
    fetchCart();
  }, [dispatch, userId]);

  const handleRemoveItem = async (id: number) => {
    try {
      dispatch(removeFromCart(id));
      await cartService.removeFromCart(userId, id);
    } catch (error) {
      console.error('Error removing item:', error);
      setErrorMessage('Failed to remove item. Please try again.');
    }
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    try {
      dispatch(updateQuantity({ id, quantity }));
      await cartService.updateCartQuantity(userId, id, quantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setErrorMessage('Failed to update quantity. Please try again.');
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      setErrorMessage('Your cart is empty!');
      return;
    }

    setIsCheckingOut(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Call the API to create a Razorpay order
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const { orderId } = await response.json();

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // Your Razorpay API Key
          amount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100, // Amount in paise
          currency: 'INR',
          name: 'Your Store Name',
          description: 'Payment for your order',
          order_id: orderId,
          handler: async (response: any) => {
            // Handle payment success
            console.log('Payment successful:', response);
            setSuccessMessage('Payment successful! Your order has been placed.');

            // Optional: Clear the cart after successful payment
            // dispatch(setCartItems([]));

            // Optional: Redirect to a success page
            // router.push('/checkout/success');
          },
          prefill: {
            name: 'Customer Name', // Prefill customer details
            email: 'customer@example.com',
            contact: '9999999999',
          },
          theme: {
            color: '#F37254', // Customize the modal theme
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal dismissed');
              setErrorMessage('Payment was cancelled. Please try again.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      setErrorMessage('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}>
      <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>Shopping Cart</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className={`text-center py-8 ${THEMES[theme].text.muted}`}>
          <p>Your cart is empty</p>
          <Link href="/products" className="text-yellow-500 hover:text-yellow-600">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between ${THEMES[theme].border} border-b py-4`}
            >
              <div className="flex-1">
                <h3 className={`font-semibold ${THEMES[theme].text.primary}`}>{item.name}</h3>
                <p className={THEMES[theme].text.primary}>${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className={`p-1 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary}`}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="text-right">
            <p className={`text-xl font-bold ${THEMES[theme].text.primary}`}>
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`mt-4 px-6 py-2 rounded ${
                theme === 'light'
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              } ${isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;



// 'use client'

// import { useSelector, useDispatch } from 'react-redux'
// import { selectCartItems, removeFromCart, updateQuantity, setCartItems } from '@/redux/cartSlice'
// import { cartService } from '@/services/cartService'
// import { useEffect, useState } from 'react'
// import { X } from 'lucide-react'
// import Link from 'next/link'
// import { FC } from 'react'
// import { supabase } from '@/utils/supabase'

// // Define the THEMES object
// const THEMES = {
//   light: {
//     background: {
//       primary: "bg-white",
//       secondary: "bg-yellow-50",
//     },
//     text: {
//       primary: "text-black",
//       secondary: "text-gray-700",
//       muted: "text-gray-500",
//     },
//     border: "border-gray-200",
//     dropdown: {
//       background: "bg-yellow-50",
//       text: "text-gray-800",
//       hover: "hover:bg-yellow-100",
//     },
//   },
//   dark: {
//     background: {
//       primary: "bg-black",
//       secondary: "bg-gray-900",
//     },
//     text: {
//       primary: "text-white",
//       secondary: "text-gray-300",
//       muted: "text-gray-500",
//     },
//     border: "border-gray-800",
//     dropdown: {
//       background: "bg-gray-900",
//       text: "text-gray-300",
//       hover: "hover:bg-gray-800",
//     },
//   },
// };

// const CartPage: FC = () => {
//   const [theme] = useState<'light' | 'dark'>('light')
//   const dispatch = useDispatch()
//   const cartItems = useSelector(selectCartItems)
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [userId, setUserId] = useState<string | null>(null)

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         // Get current session
//         const { data: { session } } = await supabase.auth.getSession()
        
//         if (!session) {
//           setError('No active session. Please log in.')
//           setIsLoading(false)
//           return
//         }

//         const user = session.user
//         console.log('Current user:', user) // Debug log
//         setUserId(user.id)

//         // Ensure user exists in users_onescoop table
//         const { data: existingUser, error: userError } = await supabase
//           .from('users_onescoop')
//           .select('id')
//           .eq('id', user.id)
//           .single()

//         if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows found"
//           throw userError
//         }

//         if (!existingUser) {
//           // Create user entry if it doesn't exist
//           const { error: insertError } = await supabase
//             .from('users_onescoop')
//             .insert({ id: user.id, cart: [] })
          
//           if (insertError) throw insertError
//           console.log('Created new user entry for:', user.id)
//         }
//       } catch (err) {
//         console.error('Auth initialization error:', err)
//         setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`)
//       }
//     }

//     initializeAuth()
//   }, [])

//   useEffect(() => {
//     if (!userId) return;

//     const fetchCart = async () => {
//       try {
//         setIsLoading(true)
//         console.log('Fetching cart for userId:', userId)
        
//         const cart = await cartService.getUserCart(userId)
//         console.log('Raw cart data:', cart)
        
//         dispatch(setCartItems(cart || []))
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
//         console.error('Detailed error fetching cart:', {
//           message: errorMessage,
//           userId,
//           err
//         })
//         setError(`Failed to load cart: ${errorMessage}`)
//       } finally {
//         setIsLoading(false)
//       }
//     }
    
//     fetchCart()
//   }, [dispatch, userId])

//   const handleRemoveItem = async (id: number) => {
//     if (!userId) return;
//     try {
//       dispatch(removeFromCart(id))
//       await cartService.removeFromCart(userId, id)
//     } catch (error) {
//       console.error('Error removing item:', error)
//     }
//   }

//   const handleQuantityChange = async (id: number, quantity: number) => {
//     if (!userId) return;
//     try {
//       dispatch(updateQuantity({ id, quantity }))
//       await cartService.updateCartQuantity(userId, id, quantity)
//     } catch (error) {
//       console.error('Error updating quantity:', error)
//     }
//   }

//   const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

//   if (isLoading) {
//     return (
//       <div className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}>
//         <p className={THEMES[theme].text.primary}>Loading cart...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}>
//         <p className={`text-red-500 ${THEMES[theme].text.primary}`}>{error}</p>
//         <Link href="/login" className="text-yellow-500 hover:text-yellow-600">
//           Go to Login
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}>
//       <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
//         Shopping Cart
//       </h1>
      
//       {cartItems.length === 0 ? (
//         <div className={`text-center py-8 ${THEMES[theme].text.muted}`}>
//           <p>Your cart is empty</p>
//           <Link href="/products" className="text-yellow-500 hover:text-yellow-600">
//             Continue Shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {cartItems.map((item) => (
//             <div 
//               key={item.id} 
//               className={`flex items-center justify-between ${THEMES[theme].border} border-b py-4`}
//             >
//               <div className="flex-1">
//                 <h3 className={`font-semibold ${THEMES[theme].text.primary}`}>
//                   {item.name}
//                 </h3>
//                 <p className={THEMES[theme].text.primary}>
//                   ${item.price.toFixed(2)}
//                 </p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <select
//                   value={item.quantity}
//                   onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
//                   className={`p-1 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary}`}
//                 >
//                   {[...Array(10)].map((_, i) => (
//                     <option key={i + 1} value={i + 1}>
//                       {i + 1}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() => handleRemoveItem(item.id)}
//                   className="text-red-500 hover:text-red-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           ))}
          
//           <div className="text-right">
//             <p className={`text-xl font-bold ${THEMES[theme].text.primary}`}>
//               Total: ${total.toFixed(2)}
//             </p>
//             <button 
//               className={`mt-4 px-6 py-2 rounded ${
//                 theme === 'light' 
//                   ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
//                   : 'bg-yellow-600 text-white hover:bg-yellow-700'
//               }`}
//             >
//               Proceed to Checkout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default CartPage