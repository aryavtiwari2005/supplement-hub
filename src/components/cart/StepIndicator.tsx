import { THEMES } from "./CartPage";

const StepIndicator = ({
  checkoutStep,
  theme,
}: {
  checkoutStep: number;
  theme: "light";
}) => (
  <div className="flex w-full mb-4 sm:mb-8 items-center">
    {[1, 2, 3].map((step) => (
      <div
        key={step}
        className={`flex flex-col items-center w-1/3 ${
          checkoutStep >= step ? "text-yellow-500" : THEMES[theme].text.muted
        }`}
      >
        <div
          className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-sm sm:text-base ${
            checkoutStep >= step
              ? "bg-yellow-500 text-white"
              : `bg-gray-200 ${THEMES[theme].text.muted}`
          }`}
        >
          {step}
        </div>
        <span className="text-xs sm:text-sm mt-1">
          {["Cart", "Address", "Payment"][step - 1]}
        </span>
        {step < 3 && (
          <div
            className={`h-1 w-full ${
              checkoutStep > step ? "bg-yellow-500" : "bg-gray-200"
            } hidden sm:block`}
          ></div>
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
