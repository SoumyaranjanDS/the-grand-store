import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin/auctions');
    } else {
      setProfileForm({ name: user.name, email: user.email });
      setLoading(false);
    }
  }, [user, navigate]);

  if (!user || loading) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, profileForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      updateUser(data);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
    }
    setIsSavingPassword(true);
    setPasswordMessage(null);
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      updateUser(data);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12 pb-16">
      
      {/* Header */}
      <section className="mb-4">
        <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 tracking-wide">
          Profile Settings
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-md font-light">
          Manage your personal information and security.
        </p>
      </section>

      {/* Profile Form */}
      <section>
        <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-6 border-b border-white/10 pb-2">
          Personal Information
        </h2>
        
        {profileMessage && (
          <div className={`p-3 rounded-md text-sm mb-6 ${profileMessage.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'} flex items-center gap-2`}>
            {profileMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Name</label>
              <input 
                type="text" 
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors font-light text-lg"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Email Address (Cannot be changed)</label>
              <input 
                type="email" 
                disabled
                value={profileForm.email}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-white/50 focus:outline-none font-light text-lg cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isSavingProfile || (profileForm.name === user.name && profileForm.email === user.email)}
              className="mt-2 text-xs uppercase tracking-widest font-bold text-black bg-[var(--color-gold)] px-8 py-3 hover:bg-[#b58b38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Password Form */}
      <section>
        <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-6 border-b border-white/10 pb-2 mt-8">
          Security
        </h2>

        {passwordMessage && (
          <div className={`p-3 rounded-md text-sm mb-6 ${passwordMessage.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'} flex items-center gap-2`}>
            {passwordMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Current Password</label>
              <input 
                type="password" 
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full max-w-sm bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors font-light text-lg tracking-widest"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors font-light text-lg tracking-widest"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-[var(--color-gold)] focus:outline-none transition-colors font-light text-lg tracking-widest"
              />
            </div>
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="mt-2 text-xs uppercase tracking-widest font-bold text-white border border-white/20 hover:bg-white/10 px-8 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
