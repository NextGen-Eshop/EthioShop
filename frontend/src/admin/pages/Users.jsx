import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { usePermission } from '../../hooks/usePermission';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'customer', label: 'Customer' },
  { value: 'user', label: 'User (legacy)' },
];

export default function Users() {
  const { can } = usePermission();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/api/users')
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setUsers(Array.isArray(d) ? d : []);
      })
      .catch((e) => toast.error(e.response?.data?.message || 'Could not load users'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId, role) => {
    if (!can('change_role')) {
      toast.error('You do not have permission to change roles');
      return;
    }
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-8 text-slate-500 text-sm">Loading users…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers & staff</h1>
        <p className="text-slate-500 text-sm mt-1">View accounts and assign roles. Only administrators can change roles.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  {can('change_role') ? (
                    <select
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold uppercase text-slate-600">{u.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
