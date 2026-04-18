import { useState } from 'react';
import { HiOutlinePlus, HiOutlineXMark, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import UsersTable from '../components/users/UsersTable';
import { userRoles, users as mockUsers } from '../data/mockData';

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialUserForm);

  const handleAddUser = (user) => {
    setUsers((current) => [
      {
        ...user,
        id: Date.now(),
      },
      ...current,
    ]);
  };

  const handleDeleteUser = (userId) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddUser({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      role: formData.role,
      password: formData.password,
    });
    setFormData(initialUserForm);
    setIsFormOpen(false);
  };

  const closeForm = () => {
    setFormData(initialUserForm);
    setIsFormOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Team</h1>
          <p className="text-slate-500 text-sm">Manage access, roles and permissions for your team.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative max-w-md">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search team members..." 
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <UsersTable users={users} onDeleteUser={handleDeleteUser} />
      </div>

      {/* Minimalist Slide-over Placeholder / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-900">Add Team Member</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-900 transition-colors">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <MinimalInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                <MinimalInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              <MinimalInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <MinimalInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="w-full h-11 px-4 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                >
                  {userRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeForm} 
                  className="flex-1 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MinimalInput({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        required 
        className="w-full h-11 px-4 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
        {...props} 
      />
    </div>
  );
}

const initialUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: userRoles[0],
};
