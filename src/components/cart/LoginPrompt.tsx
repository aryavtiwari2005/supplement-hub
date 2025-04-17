import { THEMES } from "./CartPage";

const LoginPrompt = ({ router, theme }: { router: any; theme: "light" }) => (
  <>
    <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
      Please log in to view your cart
    </div>
    <div className="text-center py-6 sm:py-8">
      <button
        onClick={() => router.push("/login")}
        className="px-4 sm:px-5 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 text-sm sm:text-base"
      >
        Go to Login
      </button>
    </div>
  </>
);

export default LoginPrompt;
