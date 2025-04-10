import { THEMES } from "./CartPage";

const LoadingState = ({ theme }: { theme: "light" }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <p className={THEMES[theme].text.muted}>Loading...</p>
  </div>
);

export default LoadingState;
