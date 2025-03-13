import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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
    return <div className="container mx-auto p-4">Error loading blogs</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs?.map((blog: Blog) => (
          <Link
            key={blog.id}
            href={`/blogs/${blog.slug}`}
            className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {blog.image_url && (
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-500">
                Published on {new Date(blog.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
