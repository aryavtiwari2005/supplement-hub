import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Blog {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export default async function BlogsPage() {
  const { data: blogs, error } = await supabase
    .from("blogs_onescoop")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-red-500 mb-2">
            Unable to load blogs
          </h2>
          <p className="text-gray-600">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="pt-16 pb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4 font-sans">
            Blogs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Insights, updates, and stories from our team
          </p>
        </header>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs?.map((blog: Blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative">
                {blog.image_url ? (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      No image available
                    </span>
                  </div>
                )}
                <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm m-3 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {blog.title}
                </h2>

                <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium">
                  <span>Read more</span>
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
