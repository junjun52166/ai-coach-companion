// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        // If no user is logged in, redirect to the login page
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes to handle logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        router.push('/auth'); // Redirect to login on logout
      }
    });

    return () => subscription.unsubscribe();
  }, [router]); // Depend on router to avoid lint warnings, though it's stable

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    }
    // onAuthStateChange will handle the redirect after successful signOut
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}>加载中...</div>;
  }

  if (!user) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return null;
  }

  return (
    <div style={{ maxWidth: 800, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>欢迎来到 Dashboard, {user.email}!</h2>
      <p>这里是用户登录后的主页内容。</p>
      <button
        style={{ marginTop: 24, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        onClick={handleLogout}
      >
        退出登录
      </button>
    </div>
  );
}