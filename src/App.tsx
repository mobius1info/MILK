import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase, Profile } from './lib/supabase';
import LoadingScreen from './components/LoadingScreen';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminLoginForm from './components/Auth/AdminLoginForm';
import AdminPage from './pages/AdminPage';
import ClientPage from './pages/ClientPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
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
    if (isFetchingProfile) return;

    setIsFetchingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (retryCount < 3) {
          setIsFetchingProfile(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
        return;
      }

      if (data) {
        setProfile(data);
        setIsLoading(false);
        setIsFetchingProfile(false);
      } else {
        if (retryCount < 3) {
          console.log(`Profile not found, retry ${retryCount + 1}/3`);
          setIsFetchingProfile(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        console.error('Profile not found after retries');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (retryCount < 3) {
        setIsFetchingProfile(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retryCount + 1);
      }
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      setIsFetchingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    return (
      <BrowserRouter>
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
                />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            profile.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <ClientPage
                profile={profile}
                onLogout={handleLogout}
                onBalanceUpdate={() => fetchProfile(profile.id)}
              />
            )
          }
        />
        <Route
          path="/admin"
          element={
            profile.role === 'admin' ? (
              <AdminPage profile={profile} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
