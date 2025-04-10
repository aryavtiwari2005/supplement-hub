import { THEMES } from "./CartPage";

const LoginPrompt = ({ router, theme }: { router: any; theme: "light" }) => (
  <>
    <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      Please log in to view your cart
    </div>
    <div className="text-center py-8">
      <button
        onClick={() => router.push("/login")}
        className="px-5 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
      >
        Go to Login
      </button>
    </div>
  </>
);

export default LoginPrompt;
