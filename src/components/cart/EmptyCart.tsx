import Link from "next/link";
import { THEMES } from "./CartPage";

const EmptyCart = ({ theme }: { theme: "light" }) => (
  <>
    <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      Your cart is empty
    </div>
    <div className="text-center py-8">
      <Link
        href="/products"
        className="px-5 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
      >
        Continue Shopping
      </Link>
    </div>
  </>
);

export default EmptyCart;
