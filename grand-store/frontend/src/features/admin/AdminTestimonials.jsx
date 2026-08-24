import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function AdminTestimonials() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quote: "",
    image: "",
    role: "Wine farm partner",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTestimonials(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", quote: "", image: "", role: "Wine farm partner", isActive: true });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setFormData({ name: t.name, quote: t.quote, image: t.image, role: t.role, isActive: t.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/testimonials/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/testimonials`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (error) {
      console.error(error);
      alert("Failed to save testimonial.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error(error);
      alert("Failed to delete testimonial.");
    }
  };

  if (loading) return <div className="p-8 text-gold-gradient animate-pulse">Loading testimonials...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2">Manage Testimonials</h1>
          <p className="text-[var(--color-ivory-muted)] text-sm">Add, edit, or remove testimonials displayed on the Wine Farm page.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-[#b58b38] hover:bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-lg transition-colors">
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-black/50 text-[var(--color-gold)] font-serif border-b border-white/10">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name & Role</th>
              <th className="p-4">Quote</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No testimonials found.</td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </td>
                  <td className="p-4 max-w-md truncate text-gray-400" title={t.quote}>
                    "{t.quote}"
                  </td>
                  <td className="p-4">
                    {t.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md"><CheckCircle size={12}/> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md"><XCircle size={12}/> Hidden</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(t)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-serif text-white mb-6">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Role</label>
                <input required type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Image URL</label>
                <input required type="text" name="image" placeholder="/assets/testimonial-1.jpg" value={formData.image} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Quote</label>
                <textarea required rows="4" name="quote" value={formData.quote} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <label htmlFor="isActive" className="text-sm text-white">Active (Display on site)</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-[#b58b38] hover:bg-[#c9a35b] text-black font-bold px-4 py-2 rounded text-sm transition-colors">
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
