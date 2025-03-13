import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Blog {
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export async function generateStaticParams() {
  const { data: blogs } = await supabase.from("blogs").select("slug");
  return (
    blogs?.map((blog) => ({
      slug: blog.slug,
    })) || []
  );
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: blog, error } = await supabase
    .from("blogs_onescoop")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !blog) {
    return <div className="container mx-auto p-4">Blog not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      {blog.image_url && (
        <img
          src={blog.image_url}
          alt={blog.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      <p className="text-gray-500 mt-4">
        Published on {new Date(blog.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
