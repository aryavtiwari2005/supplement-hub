interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface BlogTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
}

export default function BlogTable({ blogs, onEdit, onDelete }: BlogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-gray-700">Title</th>
            <th className="px-4 py-3 text-left text-gray-700">Slug</th>
            <th className="px-4 py-3 text-left text-gray-700">Created At</th>
            <th className="px-4 py-3 text-left text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
              <td className="border-t px-4 py-3">{blog.id}</td>
              <td className="border-t px-4 py-3">{blog.title}</td>
              <td className="border-t px-4 py-3">{blog.slug}</td>
              <td className="border-t px-4 py-3">
                {new Date(blog.created_at).toLocaleDateString()}
              </td>
              <td className="border-t px-4 py-3 space-x-2">
                <button
                  onClick={() => onEdit(blog)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(blog.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
