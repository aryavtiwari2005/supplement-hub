interface User {
  id: number;
  email: string;
  orders: any[]; // Adjust as needed
  scoopPoints?: number;
}

const UserTable = ({
  users,
  setUsers,
  onUpdatePoints,
}: {
  users: User[];
  setUsers: (users: User[]) => void;
  onUpdatePoints: (userId: number, points: number) => void;
}) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Email
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Scoop Points
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {users.map((user) => (
        <tr key={user.id}>
          <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="number"
              value={user.scoopPoints || 0}
              onChange={(e) => {
                const newPoints = parseInt(e.target.value) || 0;
                const newUsers = users.map((u) =>
                  u.id === user.id ? { ...u, scoopPoints: newPoints } : u
                );
                setUsers(newUsers); // Update parent state for immediate UI feedback
              }}
              className="border rounded p-1 w-20"
              min="0"
            />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => onUpdatePoints(user.id, user.scoopPoints || 0)}
              className="text-blue-600 hover:text-blue-800"
            >
              Save
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default UserTable;
