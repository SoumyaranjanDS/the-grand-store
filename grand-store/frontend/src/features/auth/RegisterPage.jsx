import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, googleLogin } = useAuth();
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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await googleLogin(tokenResponse.credential || tokenResponse.access_token, 'customer');
        let defaultRoute = '/customer/profile';
        if (userData.role === 'admin') defaultRoute = '/admin/auctions';
        if (userData.role === 'vendor_active') defaultRoute = '/vendor/dashboard';
        
        navigate(defaultRoute);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Sign Up Failed'),
  });

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12 md:py-20 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 flex items-center gap-2 text-[var(--color-ivory-muted)] hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold"
      >
        <ArrowLeft size={16} /> Back
      </button>

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
            
            <div className="relative mt-6 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#0a0a0a] px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loginWithGoogle()}
              className="w-full flex justify-center items-center py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-xl gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
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
