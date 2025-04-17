import { THEMES } from "./CartPage";

const LoadingState = ({ theme }: { theme: "light" }) => (
  <div className="min-h-[150px] sm:min-h-[200px] flex items-center justify-center">
    <p className={`text-sm sm:text-base ${THEMES[theme].text.muted}`}>
      Loading...
    </p>
  </div>
);

export default LoadingState;
