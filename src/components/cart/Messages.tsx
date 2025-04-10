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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {errorMessage}
      </div>
    )}
    {successMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {successMessage}
      </div>
    )}
  </>
);

export default Messages;
