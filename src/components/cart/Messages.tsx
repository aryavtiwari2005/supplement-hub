import { THEMES } from "./CartPage";

const Messages = ({
  errorMessage,
  successMessage,
  theme,
}: {
  errorMessage: string;
  successMessage: string;
  theme: "light";
}) => (
  <>
    {errorMessage && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
        {errorMessage}
      </div>
    )}
    {successMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
        {successMessage}
      </div>
    )}
  </>
);

export default Messages;
