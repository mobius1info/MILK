import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, Profile } from './lib/supabase';
import LoadingScreen from './components/LoadingScreen';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminLoginForm from './components/Auth/AdminLoginForm';
import AdminPage from './pages/AdminPage';
import ClientPage from './pages/ClientPage';
import NotificationModal from './components/NotificationModal';

function MainApp({ profile, handleLogout, fetchProfile }: { profile: Profile; handleLogout: () => void; fetchProfile: (id: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname === '/admin';

  useEffect(() => {
    if (profile.role === 'admin' && location.pathname === '/') {
      navigate('/admin', { replace: true });
    } else if (profile.role !== 'admin' && location.pathname === '/admin') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, profile.role, navigate]);

  return (
    <>
      <div style={{ display: isAdminRoute && profile.role === 'admin' ? 'block' : 'none' }}>
        {profile.role === 'admin' && <AdminPage profile={profile} onLogout={handleLogout} />}
      </div>
      <div style={{ display: !isAdminRoute || profile.role !== 'admin' ? 'block' : 'none' }}>
        <ClientPage
          profile={profile}
          onLogout={handleLogout}
          onBalanceUpdate={() => fetchProfile(profile.id)}
        />
      </div>
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [currentFetchUserId, setCurrentFetchUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined
  });

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('User email:', session?.user?.email);
      console.log('User ID:', session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('SIGNED_IN event detected, setting user...');
        setUser(session.user);
        setIsLoading(true);
        console.log('Fetching profile...');
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event detected, clearing user and profile...');
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string, retryCount = 0): Promise<void> => {
    if (isFetchingProfile && currentFetchUserId === userId) {
      console.log('Already fetching profile for this user, skipping...');
      return;
    }

    console.log(`Fetching profile for user ${userId}, attempt ${retryCount + 1}/8`);
    setIsFetchingProfile(true);
    setCurrentFetchUserId(userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (retryCount < 8) {
          setIsFetchingProfile(false);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchProfile(userId, retryCount + 1);
        }
        console.error('Profile fetch failed after 8 retries, signing out...');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
        setCurrentFetchUserId(null);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data.email);
        setProfile({
          ...data,
          balance: Number(data.balance)
        });
        setIsLoading(false);
        setIsFetchingProfile(false);
        setCurrentFetchUserId(null);
      } else {
        if (retryCount < 8) {
          console.log(`Profile not found, retry ${retryCount + 1}/8 in 2s...`);
          setIsFetchingProfile(false);
          setCurrentFetchUserId(null);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchProfile(userId, retryCount + 1);
        }
        console.error('Profile not found after 8 retries, signing out...');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
        setCurrentFetchUserId(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (retryCount < 8) {
        setIsFetchingProfile(false);
        setCurrentFetchUserId(null);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchProfile(userId, retryCount + 1);
      }
      console.error('Profile fetch exception after 8 retries, signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      setIsFetchingProfile(false);
      setCurrentFetchUserId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  console.log('=== APP RENDER ===');
  console.log('isLoading:', isLoading);
  console.log('user:', user?.email || 'null');
  console.log('profile:', profile?.email || 'null');
  console.log('isFetchingProfile:', isFetchingProfile);

  if (isLoading) {
    console.log('>>> Rendering LoadingScreen');
    return <LoadingScreen />;
  }

  return (
    <>
      <BrowserRouter>
        {!user || !profile ? (
          <>
            {console.log('>>> Rendering AUTH FORMS (missing:', !user ? 'user' : 'profile', ')')}
            <Routes>
              <Route
                path="/admin"
                element={<AdminLoginForm onSuccess={checkUser} />}
              />
              <Route
                path="*"
                element={
                  showLogin ? (
                    <LoginForm
                      onSuccess={checkUser}
                      onToggleForm={() => setShowLogin(false)}
                    />
                  ) : (
                    <RegisterForm
                      onSuccess={checkUser}
                      onToggleForm={() => setShowLogin(true)}
                      onShowNotification={setNotification}
                    />
                  )
                }
              />
            </Routes>
          </>
        ) : (
          <>
            {console.log('Rendering main app with profile:', profile.email)}
            <MainApp profile={profile} handleLogout={handleLogout} fetchProfile={fetchProfile} />
            <Routes>
              <Route path="/" element={null} />
              <Route path="/admin" element={null} />
              <Route path="*" element={<Navigate to={profile.role === 'admin' ? '/admin' : '/'} replace />} />
            </Routes>
          </>
        )}
      </BrowserRouter>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false, onConfirm: undefined })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
      />
    </>
  );
}

export default App;
