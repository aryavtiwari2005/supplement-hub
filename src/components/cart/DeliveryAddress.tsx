import { Dispatch, SetStateAction } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { THEMES, NOIDA_PIN_CODES } from "./CartPage";

type UserAddress = {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: UserAddress;
  paymentPreference?: string;
};

const DeliveryAddress = ({
  address,
  setAddress,
  setCheckoutStep,
  setErrorMessage,
  setSuccessMessage,
  isProcessing,
  setIsProcessing,
  user,
  theme,
  isNoidaDelivery,
}: {
  address: UserAddress;
  setAddress: Dispatch<SetStateAction<UserAddress>>; // Updated type
  setCheckoutStep: (step: 1 | 2 | 3) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  user: User | null;
  theme: "light";
  isNoidaDelivery: boolean;
}) => {
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev: UserAddress) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!user?.id) return;
    const requiredFields = ["street", "city", "state", "zipCode"];
    if (requiredFields.some((field) => !address[field as keyof UserAddress])) {
      setErrorMessage("Please fill in all required address fields.");
      return;
    }
    if (!/^\d{6}$/.test(address.zipCode)) {
      setErrorMessage("PIN Code must be a 6-digit number.");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-address", address }),
        credentials: "include",
      });
      if (response.ok) {
        setSuccessMessage("Address saved successfully");
        setCheckoutStep(3);
      } else throw new Error("Failed to save address");
    } catch (error) {
      console.error("Error saving address:", error);
      setErrorMessage("An error occurred while saving your address");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg ${THEMES[theme].background.secondary} ${THEMES[theme].border} border`}
    >
      <h2 className={`text-xl font-bold mb-4 ${THEMES[theme].text.primary}`}>
        <MapPin className="inline-block mr-2 mb-1" /> Delivery Address
      </h2>
      <div className="space-y-4">
        <div>
          <label
            className={`block mb-1 ${THEMES[theme].text.secondary}`}
            htmlFor="street"
          >
            Street Address *
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            placeholder="123 Main St"
            className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
            required
          />
        </div>
        {/* <div>
          <label
            className={`block mb-1 ${THEMES[theme].text.secondary}`}
            htmlFor="landmark"
          >
            Landmark (Optional)
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={address.landmark || ""}
            onChange={handleAddressChange}
            placeholder="Near XYZ Mall"
            className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          />
        </div> */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={`block mb-1 ${THEMES[theme].text.secondary}`}
              htmlFor="city"
            >
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="Noida"
              className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
              required
            />
          </div>
          <div>
            <label
              className={`block mb-1 ${THEMES[theme].text.secondary}`}
              htmlFor="state"
            >
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              placeholder="Uttar Pradesh"
              className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
              required
            />
          </div>
        </div>
        <div>
          <label
            className={`block mb-1 ${THEMES[theme].text.secondary}`}
            htmlFor="zipCode"
          >
            PIN Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={address.zipCode}
            onChange={handleAddressChange}
            placeholder="201301"
            className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
            required
          />
          {isNoidaDelivery && (
            <p className="text-green-600 text-sm mt-1">
              Eligible for 1-Day Delivery!
            </p>
          )}
        </div>
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCheckoutStep(1)}
            className={`px-4 py-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          >
            <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Back to Cart
          </button>
          <button
            onClick={handleSaveAddress}
            disabled={isProcessing}
            className={`px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? "Saving..." : "Continue to Payment"}{" "}
            <ArrowRight className="inline-block ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddress;
