import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: () => void;
  onToggleForm: () => void;
}

export default function RegisterForm({ onSuccess, onToggleForm }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Wait for profile to be created by trigger
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Find referrer if code provided
        let referrerId = null;
        if (referralCode) {
          const { data: referrerData } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode)
            .maybeSingle();

          if (referrerData) {
            referrerId = referrerData.id;
          }
        }

        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            referred_by: referrerId,
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Show success message
        setError('');
        alert('Registration successful! Welcome to MK MALL!');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent">
            MK MALL
          </h2>
          <h3 className="mt-4 text-center text-2xl font-bold text-gray-900">Create your account</h3>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                placeholder="Enter referral code"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            <span>{loading ? 'Creating account...' : 'Sign up'}</span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleForm}
              className="text-[#2a5f64] hover:underline text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
