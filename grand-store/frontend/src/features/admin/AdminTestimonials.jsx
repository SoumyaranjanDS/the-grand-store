<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
=======
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
>>>>>>> 3a7b284cf1702143e00d6fcd62db121e35935501

export default function AdminTestimonials() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
<<<<<<< HEAD
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
=======
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image: '',
    bottle: '',
    text: '',
    rating: 5,
    date: 'Verified Client',
    isVisible: true
  });
  const [currentId, setCurrentId] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/testimonials/admin', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
>>>>>>> 3a7b284cf1702143e00d6fcd62db121e35935501
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

<<<<<<< HEAD
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
=======
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditMode(true);
      setCurrentId(testimonial._id);
      setFormData({
        name: testimonial.name || '',
        location: testimonial.location || '',
        image: testimonial.image || '',
        bottle: testimonial.bottle || '',
        text: testimonial.text || '',
        rating: testimonial.rating || 5,
        date: testimonial.date || 'Verified Client',
        isVisible: testimonial.isVisible !== undefined ? testimonial.isVisible : true
      });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        name: '',
        location: '',
        image: '',
        bottle: '',
        text: '',
        rating: 5,
        date: 'Verified Client',
        isVisible: true
      });
    }
>>>>>>> 3a7b284cf1702143e00d6fcd62db121e35935501
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
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
=======
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/testimonials/${currentId}` : '/api/testimonials';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchTestimonials();
      } else {
        alert('Failed to save testimonial');
      }
    } catch (error) {
      console.error(error);
>>>>>>> 3a7b284cf1702143e00d6fcd62db121e35935501
    }
  };

  const handleDelete = async (id) => {
<<<<<<< HEAD
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
=======
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          fetchTestimonials();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleVisibility = async (t) => {
    try {
      const res = await fetch(`/api/testimonials/${t._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ isVisible: !t.isVisible })
      });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[var(--color-ivory)] uppercase tracking-widest">Manage Testimonials</h1>
          <p className="text-[var(--color-ivory-muted)] mt-1 text-sm uppercase tracking-widest">Add, edit, or hide homepage testimonials</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gold-gradient text-black px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-[var(--color-gold)]" size={32} /></div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)]">No testimonials found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--color-ivory-muted)]">Client</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--color-ivory-muted)]">Review Text</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--color-ivory-muted)]">Bottle Mentioned</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--color-ivory-muted)]">Visibility</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--color-ivory-muted)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(t => (
                  <tr key={t._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--color-ivory)]">{t.name}</div>
                      <div className="text-xs text-[var(--color-ivory-muted)]">{t.location}</div>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-ivory-muted)] max-w-xs truncate">
                      {t.text}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-ivory-muted)]">
                      {t.bottle || '-'}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleVisibility(t)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${t.isVisible ? 'bg-green-900/30 border-green-500/30 text-green-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}
                      >
                        {t.isVisible ? <><Eye size={12}/> Visible</> : <><EyeOff size={12}/> Hidden</>}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(t)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
              <h2 className="text-xl font-serif text-[var(--color-ivory)] uppercase tracking-widest">{editMode ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Location</label>
                  <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Image URL (Optional)</label>
                <input name="image" value={formData.image} onChange={handleInputChange} placeholder="/assets/testimonials/avatar.jpg" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Bottle Mentioned (Optional)</label>
                  <input name="bottle" value={formData.bottle} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Date Text</label>
                  <input name="date" value={formData.date} onChange={handleInputChange} placeholder="Verified Client" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Review Text</label>
                <textarea required name="text" value={formData.text} onChange={handleInputChange} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-gold)]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleInputChange} className="w-4 h-4 accent-[var(--color-gold)]" />
                <label className="text-sm text-[var(--color-ivory)]">Visible on Homepage</label>
              </div>
              <div className="mt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-white/10 text-white rounded-xl hover:bg-white/5 uppercase text-xs tracking-widest">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gold-gradient text-black font-bold rounded-xl hover:brightness-110 uppercase text-xs tracking-widest">Save</button>
>>>>>>> 3a7b284cf1702143e00d6fcd62db121e35935501
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
