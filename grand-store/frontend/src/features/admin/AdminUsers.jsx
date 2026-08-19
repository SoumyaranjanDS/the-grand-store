import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Search, Shield, User as UserIcon, Building2 } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const goldText = "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] bg-clip-text text-transparent";
  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-1 bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><Shield size={12}/> Admin</span>;
      case 'vendor_active': return <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><Building2 size={12}/> Vendor</span>;
      case 'vendor_pending': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><Building2 size={12}/> Pending Vendor</span>;
      default: return <span className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><UserIcon size={12}/> Customer</span>;
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          User <span className={goldText} style={scriptFont}>Directory</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg font-light">
          Manage all registered users on the platform.
        </p>
      </section>

      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 w-full md:w-96">
        <Search size={16} className="text-[var(--color-ivory-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="bg-transparent text-sm text-white outline-none placeholder:text-white/30 w-full"
        />
      </div>

      <div className="overflow-x-auto bg-[#0a0a0a] border border-white/5 rounded-2xl">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)] animate-pulse">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)]">No users found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                <th className="py-4 pl-6 font-semibold">Name</th>
                <th className="py-4 font-semibold">Email</th>
                <th className="py-4 font-semibold">Role</th>
                <th className="py-4 font-semibold">Joined Date</th>
                <th className="py-4 font-semibold">KYC Verified</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 text-sm text-[var(--color-ivory)] font-serif">{u.name}</td>
                  <td className="py-4 text-sm text-[var(--color-ivory-muted)]">{u.email}</td>
                  <td className="py-4">{getRoleBadge(u.role)}</td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                    {new Date(u.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                    {u.kycVerified ? <span className="text-green-400">Yes</span> : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
