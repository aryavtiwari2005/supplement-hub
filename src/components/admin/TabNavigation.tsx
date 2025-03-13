interface TabNavigationProps {
  activeTab: "products" | "coupons" | "blogs";
  setActiveTab: (tab: "products" | "coupons" | "blogs") => void;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setActiveTab("products")}
        className={`px-4 py-2 rounded-lg font-semibold ${
          activeTab === "products"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } transition-colors`}
      >
        Products
      </button>
      <button
        onClick={() => setActiveTab("coupons")}
        className={`px-4 py-2 rounded-lg font-semibold ${
          activeTab === "coupons"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } transition-colors`}
      >
        Coupons
      </button>
      <button
        onClick={() => setActiveTab("blogs")}
        className={`px-4 py-2 rounded-lg font-semibold ${
          activeTab === "blogs"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } transition-colors`}
      >
        Blogs
      </button>
    </div>
  );
}
