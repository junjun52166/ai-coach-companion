import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router'; // Import useRouter

export default function AuthPage() {
  console.log('AuthPage rendering');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter(); // Initialize useRouter

  // Keep the useEffect to handle potential auth callbacks if they land on this page
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (accessToken && refreshToken) {
          console.log('Found access_token and refresh_token in URL hash on /auth');
          // Supabase client should handle storing tokens.
          // Optionally, clear the hash after processing
          window.history.replaceState(null, '', window.location.pathname + window.location.search);

        } else if (error) {
          console.error('Supabase Auth Error:', error, errorDescription);
          setMessage(`认证回调处理失败: ${errorDescription || error}`);
          // Clear the hash from the URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    };

    handleAuthCallback();
  }, []);


  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verified` // Redirect to the verified page after email confirm
      }
     });
    setLoading(false);
    setMessage(error ? error.message : '注册成功，请查收邮箱验证邮件。请点击邮件中的链接进行确认。'); // Updated message
  }

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('登录成功');
      console.log('User signed in:', data.user); // Log successful login
      // --- Modified: Redirect to main landing page on successful login ---
      router.push('/'); // Navigate to the main landing page
      // --- End Modification ---
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>邮箱注册/登录</h2>
      <input
        style={{ width: '100%', padding: 8, marginBottom: 8, border: '1px solid #ccc', borderRadius: 4 }}
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        style={{ width: '100%', padding: 8, marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}
        type="password"
        placeholder="密码"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer' }} onClick={handleSignUp} disabled={loading}>
          注册
        </button>
        <button style={{ flex: 1, padding: 10, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer' }} onClick={handleSignIn} disabled={loading}>
          登录
        </button>
      </div>
      {/* Always render the message div to reserve space */}
      <div style={{ marginTop: 16, textAlign: 'center', color: '#555', minHeight: '1.5em' }}>
        {message}
      </div>
    </div>
  )
}