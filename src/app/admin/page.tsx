"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Product } from "@/utils/constants";
import { motion } from "framer-motion";
import TabNavigation from "@/components/admin/TabNavigation";
import ProductTable from "@/components/admin/ProductTable";
import CouponTable from "@/components/admin/CouponTable";
import ProductForm from "@/components/admin/ProductForm";
import CouponForm from "@/components/admin/CouponForm";
import BlogTable from "@/components/admin/BlogTable";
import BlogForm from "@/components/admin/BlogForm";
import ConsultationTable from "@/components/admin/ConsultationTable";
import OrderTable from "@/components/admin/OrderTable";
import UserTable from "@/components/admin/UserTable";
import BestSellerTable from "@/components/admin/BestSellerTable";
import BestSellerForm from "@/components/admin/BestSellerForm";
import { useRouter } from "next/navigation";
import { Order } from "@/types/orders";

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
}

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  fitness_goals: string;
  status: string;
  created_at: string;
  contacted: boolean;
}

interface User {
  id: number;
  email: string;
  orders: Order[];
  scoopPoints?: number;
}

interface BestSeller {
  id: number;
  product_id: number;
  sales_count: number;
  added_at: string;
  products: Product;
}

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: File | null;
  imageUrl: string | null;
  imagePath: string;
  price: string;
  originalPrice: string;
  discountPercentage: string;
  rating: string;
  description: string;
}

interface CouponFormState {
  code: string;
  discountPercentage: string;
  isActive: boolean;
  expiresAt: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface BlogFormState {
  title: string;
  slug: string;
  content: string;
  image: File | null;
  imageUrl: string | null;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    | "products"
    | "coupons"
    | "blogs"
    | "orders"
    | "consultations"
    | "users"
    | "bestSellers"
  >("products");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showBestSellerForm, setShowBestSellerForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    image: null,
    imageUrl: null,
    imagePath: "",
    price: "",
    originalPrice: "",
    discountPercentage: "",
    rating: "",
    description: "",
  });

  const [couponForm, setCouponForm] = useState<CouponFormState>({
    code: "",
    discountPercentage: "",
    isActive: true,
    expiresAt: "",
  });

  const [blogForm, setBlogForm] = useState<BlogFormState>({
    title: "",
    slug: "",
    content: "",
    image: null,
    imageUrl: null,
  });

  useEffect(() => {
    const checkUser = async () => {
      setAuthLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        router.push("/adminlogin");
      } else {
        setIsAuthenticated(true);
      }
      setAuthLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*");
      if (productError)
        throw new Error(`Product fetch error: ${productError.message}`);
      setProducts(productData as Product[]);

      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("*");
      if (couponError)
        throw new Error(`Coupon fetch error: ${couponError.message}`);
      setCoupons(couponData as Coupon[]);

      const { data: blogData, error: blogError } = await supabase
        .from("blogs_onescoop")
        .select("*")
        .order("created_at", { ascending: false });
      if (blogError) throw new Error(`Blog fetch error: ${blogError.message}`);
      setBlogs(blogData as Blog[]);

      const { data: bestSellerData, error: bestSellerError } =
        await supabase.from("best_seller_products").select(`
          id,
          product_id,
          sales_count,
          added_at,
          products!best_seller_products_product_id_fkey (
            id,
            name,
            brand,
            category,
            subcategory,
            image,
            price,
            original_price,
            discount_percentage,
            rating,
            description
          )
        `);
      if (bestSellerError)
        throw new Error(`Best seller fetch error: ${bestSellerError.message}`);
      setBestSellers(bestSellerData as unknown as BestSeller[]);

      const { data: usersData, error: usersError } = await supabase
        .from("users_onescoop")
        .select("id, email, orders, scoop_points");
      if (usersError)
        throw new Error(`Users fetch error: ${usersError.message}`);
      setUsers(
        usersData.map((u: any) => ({
          id: u.id,
          email: u.email,
          orders: u.orders || [],
          scoopPoints: u.scoop_points || 0,
        }))
      );
      const allOrders = usersData.flatMap((user) =>
        (user.orders || []).map((order: Order) => ({
          ...order,
          user_id: user.id,
          user_email: user.email,
        }))
      );
      setOrders(allOrders);

      const { data: consultationData, error: consultationError } =
        await supabase
          .from("fitness_consultations")
          .select("*")
          .order("created_at", { ascending: false });
      if (consultationError)
        throw new Error(
          `Consultation fetch error: ${consultationError.message}`
        );
      setConsultations(consultationData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    userId: number,
    orderId: string,
    newStatus: string
  ) => {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from("users_onescoop")
        .select("orders")
        .eq("id", userId)
        .single();
      if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

      const updatedOrders = userData.orders.map((order: Order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      );

      const { error: updateError } = await supabase
        .from("users_onescoop")
        .update({ orders: updatedOrders })
        .eq("id", userId);
      if (updateError) throw new Error(`Update error: ${updateError.message}`);

      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
      console.error("Error updating order status:", err);
    }
  };

  const updateScoopPoints = async (userId: number, newPoints: number) => {
    try {
      const { error } = await supabase
        .from("users_onescoop")
        .update({ scoop_points: newPoints })
        .eq("id", userId);
      if (error) throw new Error(`Update error: ${error.message}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update Scoop Points");
      console.error("Error updating scoop points:", err);
    }
  };

  const addBestSeller = async (productId: number, salesCount: number) => {
    try {
      const { error } = await supabase
        .from("best_seller_products")
        .insert([{ product_id: productId, sales_count: salesCount }]);
      if (error) throw new Error(`Insert error: ${error.message}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add best seller");
      throw err; // Re-throw to handle in form
    }
  };

  const removeBestSeller = async (id: number) => {
    if (confirm("Are you sure you want to remove this best seller?")) {
      try {
        const { error } = await supabase
          .from("best_seller_products")
          .delete()
          .eq("id", id);
        if (error) throw new Error(`Delete error: ${error.message}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || "Failed to remove best seller");
        console.error("Error removing best seller:", err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let finalImageUrl = "";
      if (productForm.image) {
        const fileExt = productForm.image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, productForm.image);
        if (uploadError)
          throw new Error("Failed to upload image: " + uploadError.message);
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      } else if (productForm.imagePath) {
        finalImageUrl = productForm.imagePath;
      } else if (editingProduct?.image) {
        finalImageUrl = editingProduct.image;
      }

      if (!finalImageUrl && !editingProduct?.image) {
        throw new Error("Please provide either an image upload or URL");
      }

      const productData = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        category: productForm.category.trim(),
        subcategory: productForm.subcategory.trim(),
        image: finalImageUrl || editingProduct?.image || "",
        price: parseFloat(productForm.price),
        original_price: productForm.originalPrice
          ? parseFloat(productForm.originalPrice)
          : null,
        discount_percentage: productForm.discountPercentage
          ? parseFloat(productForm.discountPercentage)
          : null,
        rating: parseFloat(productForm.rating),
        description: productForm.description.trim() || null,
      };

      if (isNaN(productData.price))
        throw new Error("Price must be a valid number");
      if (
        isNaN(productData.rating) ||
        productData.rating < 0 ||
        productData.rating > 5
      ) {
        throw new Error("Rating must be between 0 and 5");
      }

      let result;
      if (editingProduct) {
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
      } else {
        result = await supabase.from("products").insert([productData]);
      }

      if (result.error)
        throw new Error(`Database error: ${result.error.message}`);

      setProductForm({
        name: "",
        brand: "",
        category: "",
        subcategory: "",
        image: null,
        imageUrl: null,
        imagePath: "",
        price: "",
        originalPrice: "",
        discountPercentage: "",
        rating: "",
        description: "",
      });
      setEditingProduct(null);
      setShowProductForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
      console.error("Error saving product:", err);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const couponData = {
        code: couponForm.code.toUpperCase().trim(),
        discount_percentage: parseFloat(couponForm.discountPercentage),
        is_active: couponForm.isActive,
        expires_at: couponForm.expiresAt || null,
      };

      if (
        isNaN(couponData.discount_percentage) ||
        couponData.discount_percentage < 0 ||
        couponData.discount_percentage > 100
      ) {
        throw new Error(
          "Discount percentage must be a number between 0 and 100."
        );
      }

      const { error } = await supabase.from("coupons").insert([couponData]);
      if (error) throw new Error(`Insert error: ${error.message}`);

      setCouponForm({
        code: "",
        discountPercentage: "",
        isActive: true,
        expiresAt: "",
      });
      setShowCouponForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save coupon");
      console.error("Error saving coupon:", err);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let uploadedImageUrl = blogForm.imageUrl;
      if (blogForm.image) {
        const fileExt = blogForm.image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, blogForm.image);
        if (uploadError)
          throw new Error("Failed to upload image: " + uploadError.message);
        const { data: publicUrlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);
        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const blogData = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.toLowerCase().replace(/\s+/g, "-"),
        content: blogForm.content,
        image_url: uploadedImageUrl,
      };

      let result;
      if (editingBlog) {
        result = await supabase
          .from("blogs_onescoop")
          .update(blogData)
          .eq("id", editingBlog.id);
      } else {
        result = await supabase.from("blogs_onescoop").insert([blogData]);
      }

      if (result.error)
        throw new Error(`Insert/Update error: ${result.error.message}`);

      setBlogForm({
        title: "",
        slug: "",
        content: "",
        image: null,
        imageUrl: null,
      });
      setEditingBlog(null);
      setShowBlogForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save blog");
      console.error("Error saving blog:", err);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw new Error(`Delete error: ${error.message}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || "Failed to delete product");
        console.error("Error deleting product:", err);
      }
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      image: null,
      imageUrl: product.image || null,
      imagePath: product.image || "",
      price: product.price ? product.price.toString() : "0",
      originalPrice: product.originalPrice
        ? product.originalPrice.toString()
        : "",
      discountPercentage: product.discountPercentage
        ? product.discountPercentage.toString()
        : "",
      rating: product.rating ? product.rating.toString() : "0",
      description: product.description || "",
    });
    setShowProductForm(true);
  };

  const editBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      image: null,
      imageUrl: blog.image_url || null,
    });
    setShowBlogForm(true);
  };

  const deleteBlog = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        const { error } = await supabase
          .from("blogs_onescoop")
          .delete()
          .eq("id", id);
        if (error) throw new Error(`Delete error: ${error.message}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || "Failed to delete blog");
        console.error("Error deleting blog:", err);
      }
    }
  };

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      router.push("/adminlogin");
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to logout");
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto p-6 bg-gray-100 min-h-screen"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          "products",
          "coupons",
          "blogs",
          "orders",
          "consultations",
          "users",
          "bestSellers",
        ]}
      />

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {activeTab === "products" && !loading && (
        <>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: "",
                brand: "",
                category: "",
                subcategory: "",
                image: null,
                imageUrl: null,
                imagePath: "",
                price: "",
                originalPrice: "",
                discountPercentage: "",
                rating: "",
                description: "",
              });
              setShowProductForm(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add New Product
          </button>
          <ProductTable
            products={products}
            onEdit={editProduct}
            onDelete={deleteProduct}
          />
          {showProductForm && (
            <ProductForm
              productForm={productForm}
              setProductForm={setProductForm}
              onSubmit={handleProductSubmit}
              onClose={() => setShowProductForm(false)}
              isEditing={!!editingProduct}
            />
          )}
        </>
      )}

      {activeTab === "coupons" && !loading && !error && (
        <>
          <button
            onClick={() => setShowCouponForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add New Coupon
          </button>
          <CouponTable coupons={coupons} />
          {showCouponForm && (
            <CouponForm
              couponForm={couponForm}
              setCouponForm={setCouponForm}
              onSubmit={handleCouponSubmit}
              onClose={() => setShowCouponForm(false)}
            />
          )}
        </>
      )}

      {activeTab === "blogs" && !loading && !error && (
        <>
          <button
            onClick={() => {
              setEditingBlog(null);
              setBlogForm({
                title: "",
                slug: "",
                content: "",
                image: null,
                imageUrl: null,
              });
              setShowBlogForm(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add New Blog
          </button>
          <BlogTable blogs={blogs} onEdit={editBlog} onDelete={deleteBlog} />
          {showBlogForm && (
            <BlogForm
              blogForm={blogForm}
              setBlogForm={setBlogForm}
              onSubmit={handleBlogSubmit}
              onClose={() => setShowBlogForm(false)}
              isEditing={!!editingBlog}
            />
          )}
        </>
      )}

      {activeTab === "orders" && !loading && !error && (
        <OrderTable orders={orders} onUpdateStatus={updateOrderStatus} />
      )}

      {activeTab === "consultations" && !loading && !error && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Fitness Consultations</h2>
            <div className="text-sm text-gray-500">
              {consultations.filter((c) => !c.contacted).length} pending
              requests
            </div>
          </div>
          <ConsultationTable
            consultations={consultations}
            onUpdate={fetchData}
          />
          <div className="text-sm text-gray-500">
            <p>
              When you mark a consultation as contacted, it will be moved to the
              "Contacted" section.
            </p>
            <p>
              Our team should reach out within 1-2 business days or call the
              customer at their provided number.
            </p>
          </div>
        </div>
      )}

      {activeTab === "users" && !loading && !error && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Users</h2>
          <UserTable
            users={users}
            setUsers={setUsers}
            onUpdatePoints={updateScoopPoints}
          />
        </div>
      )}

      {activeTab === "bestSellers" && !loading && !error && (
        <>
          <button
            onClick={() => setShowBestSellerForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add Best Seller
          </button>
          <BestSellerTable
            bestSellers={bestSellers}
            onRemove={removeBestSeller}
          />
          {showBestSellerForm && (
            <BestSellerForm
              products={products.filter(
                (p) => !bestSellers.some((bs) => bs.product_id === p.id)
              )} // Exclude already selected best sellers
              onSubmit={addBestSeller}
              onClose={() => setShowBestSellerForm(false)}
            />
          )}
        </>
      )}
    </motion.div>
  );
}
