interface TabNavigationProps {
  activeTab:
    | "products"
    | "coupons"
    | "blogs"
    | "orders"
    | "consultations"
    | "users";
  setActiveTab: (
    tab: "products" | "coupons" | "blogs" | "orders" | "consultations" | "users"
  ) => void;
  tabs: Array<
    "products" | "coupons" | "blogs" | "orders" | "consultations" | "users"
  >;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  tabs,
}: TabNavigationProps) {
  // Map tab IDs to human-readable labels
  const tabLabels: { [key: string]: string } = {
    products: "Products",
    coupons: "Coupons",
    blogs: "Blogs",
    orders: "Orders",
    consultations: "Consultations",
    users: "Users",
  };

  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
            activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors`}
        >
          {tabLabels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
