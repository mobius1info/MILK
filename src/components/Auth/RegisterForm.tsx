import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: () => void;
  onToggleForm: () => void;
  onShowNotification: (notification: {
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }) => void;
}

export default function RegisterForm({ onSuccess, onToggleForm, onShowNotification }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'ML MALL - Register';
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== REGISTER FORM SUBMITTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Full name:', fullName);

    setLoading(true);
    setError('');

    try {
      console.log('Step 1: Calling supabase.auth.signUp...');

      let referrerId = null;
      if (referralCode) {
        console.log('Step 1a: Looking up referral code:', referralCode);
        const { data: referrerData } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle();

        if (referrerData) {
          referrerId = referrerData.id;
          console.log('Step 1b: Referrer found:', referrerId);
        } else {
          console.log('Step 1b: Referrer not found, continuing without referrer');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            referred_by: referrerId
          }
        }
      });

      console.log('Step 2: SignUp response received');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- User created:', !!data?.user);

      if (error) {
        console.log('Step 3: SignUp error, throwing...');
        throw error;
      }

      if (!data.user) {
        console.log('Step 3: No user in response, throwing error...');
        throw new Error('Не удалось создать пользователя. Возможно, этот email уже зарегистрирован.');
      }

      console.log('Step 4: User created successfully, ID:', data.user.id);
      console.log('Step 5: Registration complete');
      console.log('>>> Keeping loading screen ON - profile will be loaded via onAuthStateChange');

      // Не сбрасываем loading - пусть LoadingScreen показывается, пока профиль загружается
      // setLoading(false) НЕ вызываем

      // Не показываем модалку - onAuthStateChange автоматически загрузит профиль
      // и перенаправит в ЛК когда все будет готово
    } catch (err: any) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      setLoading(false);
      onShowNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка регистрации',
        message: err.message || 'Не удалось зарегистрироваться. Попробуйте снова.'
      });
      console.log('Error notification set at App level');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo55555.svg" alt="ML MALL" className="h-24 w-auto" />
          </div>
          <h3 className="mt-4 text-center text-2xl font-bold text-gray-900">Create your account</h3>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
