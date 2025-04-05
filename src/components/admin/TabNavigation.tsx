// components/admin/TabNavigation.tsx
interface TabNavigationProps {
  activeTab: "products" | "coupons" | "blogs" | "orders" | "consultations";
  setActiveTab: (
    tab: "products" | "coupons" | "blogs" | "orders" | "consultations"
  ) => void;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
      {[
        { id: "products", label: "Products" },
        { id: "coupons", label: "Coupons" },
        { id: "blogs", label: "Blogs" },
        { id: "orders", label: "Orders" },
        { id: "consultations", label: "Consultations" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
