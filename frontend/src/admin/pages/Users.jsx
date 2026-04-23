import { useState } from 'react';
import UsersTable from '../components/users/UsersTable';
import { userRoles, users as mockUsers } from '../data/mockData';

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialUserForm);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddUser = (user) => {
    setUsers((c) => [{ ...user, id: Date.now() }, ...c]);
  };

  const handleDeleteUser = (userId) => {
    setUsers((c) => c.filter((u) => u.id !== userId));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddUser({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      role: formData.role,
      password: formData.password,
    });
    setFormData(initialUserForm);
    setIsFormOpen(false);
  };

  const closeForm = () => { setFormData(initialUserForm); setIsFormOpen(false); };

  const filteredUsers = searchQuery
    ? users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Customers</h1>
          <p className="text-gray-500 text-sm">Manage access, roles and permissions for your team.</p>
        </div>
        <button type="button" onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 active:scale-[0.98]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Admins</p>
          <p className="text-2xl font-bold text-indigo-600">{users.filter(u => u.role === 'Admin').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Members</p>
          <p className="text-2xl font-bold text-gray-600">{users.filter(u => u.role !== 'Admin').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400" />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <UsersTable users={filteredUsers} onDeleteUser={handleDeleteUser} />
      </div>

      {/* Add User Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm px-4" onClick={closeForm}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 sm:p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Customer</h3>
                <p className="text-xs text-gray-400 mt-0.5">Create a new team member account</p>
              </div>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all">
                  {userRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <input required className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" {...props} />
    </div>
  );
}

const initialUserForm = { firstName: '', lastName: '', email: '', password: '', role: 'Customer' };
