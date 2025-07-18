"use client";

// Define a more flexible type for the tabs
type AdminTab =
  | "products"
  | "coupons"
  | "blogs"
  | "orders"
  | "consultations"
  | "users"
  | "bestSellers"
  | "hero"
  | "settings"; // Added 'settings'

interface TabNavigationProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  tabs: AdminTab[];
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  tabs,
}: TabNavigationProps) {
  const tabLabels: { [key in AdminTab]: string } = {
    products: "Products",
    coupons: "Coupons",
    blogs: "Blogs",
    orders: "Orders",
    consultations: "Consultations",
    users: "Users",
    bestSellers: "Best Sellers",
    hero: "Hero Section",
    settings: "Settings", // Added label for the settings tab
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tabLabels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}