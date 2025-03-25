import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

// Define the Blog interface
interface Blog {
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
  id: string;
}

// Define the params type for the dynamic route
interface Params {
  slug: string;
}

// Define a custom type for the page props
interface BlogPageProps {
  params: Promise<Params>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  // Await params to ensure it's resolved
  const resolvedParams = await params; // params is a Promise<Params> during static generation
  const slug = resolvedParams.slug;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: blog, error } = await supabase
    .from("blogs_onescoop")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Blog not found
          </h1>
          <p className="text-gray-600 mb-6">
            The blog you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  // Estimate read time based on content length (assuming average reading speed of 200 words per minute)
  const wordCount = blog.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <div className="pt-8">
          <Link
            href="/blogs"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all blogs
          </Link>
        </div>

        {/* Article header */}
        <header className="pt-8 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6 font-sans">
            {blog.title}
          </h1>

          <div className="flex items-center text-gray-600 space-x-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {blog.image_url && (
          <div className="mb-10">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-xl shadow-sm"
            />
          </div>
        )}

        {/* Article content */}
        <article className="bg-white rounded-xl shadow-sm p-8 mb-10">
          <div
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-700 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Publication info */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            Published on{" "}
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: blogs, error } = await supabase
    .from("blogs_onescoop")
    .select("slug");

  return blogs?.map((blog) => ({ slug: blog.slug })) || [];
}
