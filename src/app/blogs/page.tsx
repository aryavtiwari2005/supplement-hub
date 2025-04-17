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
        <div className="text-center p-6 sm:p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-500 mb-2">
            Unable to load blogs
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8 sm:pb-16">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <header className="pt-8 sm:pt-12 pb-6 sm:pb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4 font-sans">
            Blogs
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto">
            Insights, updates, and stories from our team
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                    className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-40 sm:h-48 md:h-56 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-gray-500 font-medium text-sm sm:text-base">
                      No image available
                    </span>
                  </div>
                )}
                <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm m-2 sm:m-3 px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {blog.title}
                </h2>

                <div className="mt-auto pt-3 sm:pt-4 flex items-center text-blue-600 font-medium text-sm sm:text-base">
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
