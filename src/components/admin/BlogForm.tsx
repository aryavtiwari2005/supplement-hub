import { motion } from "framer-motion";
import RichTextEditor from "@/components/RichTextEditor";

interface BlogFormState {
  title: string;
  slug: string;
  content: string;
  image: File | null;
  imageUrl: string | null;
}

interface BlogFormProps {
  blogForm: BlogFormState;
  setBlogForm: (form: BlogFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEditing: boolean;
}

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function BlogForm({
  blogForm,
  setBlogForm,
  onSubmit,
  onClose,
  isEditing,
}: BlogFormProps) {
  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl my-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit Blog" : "Add Blog"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={blogForm.title}
              onChange={(e) =>
                setBlogForm({ ...blogForm, title: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Slug (URL-friendly)</label>
            <input
              type="text"
              value={blogForm.slug}
              onChange={(e) =>
                setBlogForm({ ...blogForm, slug: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setBlogForm({ ...blogForm, image: e.target.files?.[0] || null })
              }
              className="w-full p-2 border rounded"
            />
            {blogForm.imageUrl && (
              <img
                src={blogForm.imageUrl}
                alt="Preview"
                className="mt-2 max-w-xs"
              />
            )}
          </div>
          <div>
            <label className="block text-gray-700">Content</label>
            <div className="max-h-80 overflow-y-auto">
              <RichTextEditor
                content={blogForm.content}
                onChange={(content: string) =>
                  setBlogForm({ ...blogForm, content })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isEditing ? "Update" : "Add"} Blog
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
