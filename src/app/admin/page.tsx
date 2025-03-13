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
import RichTextEditor from "@/components/RichTextEditor";

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
}

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  price: string;
  originalPrice: string;
  discountPercentage: string;
  rating: string;
  description: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"products" | "coupons" | "blogs">(
    "products"
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    image: "",
    price: "",
    originalPrice: "",
    discountPercentage: "",
    rating: "",
    description: "",
  });

  const [couponForm, setCouponForm] = useState({
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
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const productData = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        category: productForm.category.trim(),
        subcategory: productForm.subcategory.trim(),
        image: productForm.image.trim(),
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

      if (isNaN(productData.price) || isNaN(productData.rating)) {
        throw new Error("Price and Rating must be valid numbers.");
      }
      if (
        productData.discount_percentage &&
        (productData.discount_percentage < 0 ||
          productData.discount_percentage > 100)
      ) {
        throw new Error("Discount percentage must be between 0 and 100.");
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

      if (result.error) {
        throw new Error(`Insert/Update error: ${result.error.message}`);
      }

      setProductForm({
        name: "",
        brand: "",
        category: "",
        subcategory: "",
        image: "",
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
        result = await supabase.from("blogs").insert([blogData]);
      }

      if (result.error) {
        throw new Error(`Insert/Update error: ${result.error.message}`);
      }

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
      image: product.image || "",
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
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) throw new Error(`Delete error: ${error.message}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || "Failed to delete blog");
        console.error("Error deleting blog:", err);
      }
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto p-6 bg-gray-100 min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

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
                image: "",
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
    </motion.div>
  );
}
