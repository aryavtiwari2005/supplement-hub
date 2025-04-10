import { THEMES } from "./CartPage";

const StepIndicator = ({
  checkoutStep,
  theme,
}: {
  checkoutStep: number;
  theme: "light";
}) => (
  <div className="flex w-full mb-8 items-center">
    {[1, 2, 3].map((step) => (
      <div
        key={step}
        className={`flex flex-col items-center w-1/3 ${
          checkoutStep >= step ? "text-yellow-500" : THEMES[theme].text.muted
        }`}
      >
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            checkoutStep >= step
              ? "bg-yellow-500 text-white"
              : `bg-gray-200 ${THEMES[theme].text.muted}`
          }`}
        >
          {step}
        </div>
        <span className="text-sm mt-1">
          {["Cart", "Address", "Payment"][step - 1]}
        </span>
        {step < 3 && (
          <div
            className={`h-1 w-full ${
              checkoutStep > step ? "bg-yellow-500" : "bg-gray-200"
            }`}
          ></div>
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
