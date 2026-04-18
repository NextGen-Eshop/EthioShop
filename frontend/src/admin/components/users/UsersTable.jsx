import { HiOutlineTrash } from 'react-icons/hi2';

export default function UsersTable({ users, onDeleteUser }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[640px] text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-4 font-semibold">Full Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onDeleteUser(user.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
