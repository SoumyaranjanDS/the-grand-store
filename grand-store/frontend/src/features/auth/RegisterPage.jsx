import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userData = await register(name, email, password);
      
      let defaultRoute = '/customer/profile';
      if (userData.role === 'admin') defaultRoute = '/admin/auctions';
      if (userData.role === 'vendor_active') defaultRoute = '/vendor/dashboard';
      
      navigate(defaultRoute);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12 md:py-20 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-[var(--color-ivory-muted)] hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold z-50 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <h1 className="text-[#c9a35b] drop-shadow-[0_0_12px_rgba(230,201,122,0.6)] font-serif text-4xl md:text-5xl font-medium tracking-tight mb-4 py-2">
            Join the Cellar
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-sm md:text-base">
            Create your private account to manage your collection and unlock exclusive access to rare bottles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border-t border-white/10 p-6 md:p-8 rounded-none md:rounded-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[var(--color-ivory-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/20" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border-b border-white/10 bg-transparent text-[var(--color-ivory)] placeholder-white/20 focus:outline-none focus:border-[var(--color-gold)] sm:text-sm transition-colors rounded-none"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--color-ivory-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/20" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border-b border-white/10 bg-transparent text-[var(--color-ivory)] placeholder-white/20 focus:outline-none focus:border-[var(--color-gold)] sm:text-sm transition-colors rounded-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--color-ivory-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/20" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-4 border-b border-white/10 bg-transparent text-[var(--color-ivory)] placeholder-white/20 focus:outline-none focus:border-[var(--color-gold)] sm:text-sm transition-colors rounded-none"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] text-[10px] uppercase tracking-widest font-bold text-black bg-[#c9a35b] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 rounded-xl"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="mt-8 text-center pt-6">
            <p className="text-sm text-[var(--color-ivory-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-gold-gradient hover:text-white transition-colors inline-flex items-center gap-1">
                Sign in here <ArrowRight size={14} />
              </Link>
            </p>
            <p className="text-sm text-[var(--color-ivory-muted)] mt-4">
              Want to become a Vendor?{' '}
              <Link to="/vendor/onboarding" className="font-bold text-gold-gradient hover:text-white transition-colors inline-flex items-center gap-1">
                Apply here <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
