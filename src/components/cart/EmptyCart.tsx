import Link from "next/link";
import { THEMES } from "./CartPage";

const EmptyCart = ({ theme }: { theme: "light" }) => (
  <>
    <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
      Your cart is empty
    </div>
    <div className="text-center py-6 sm:py-8">
      <Link
        href="/products"
        className="px-4 sm:px-5 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 text-sm sm:text-base"
      >
        Continue Shopping
      </Link>
    </div>
  </>
);

export default EmptyCart;
