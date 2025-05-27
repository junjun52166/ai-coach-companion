import Link from 'next/link';

export default function VerifiedPage() {
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, textAlign: 'center' }}>
      <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>邮箱确认成功！</h2>
      <p style={{ marginBottom: 16 }}>您的邮箱已成功验证。请返回登录页面进行登录。</p>
      <Link href="/auth" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
        前往登录页面
      </Link>
    </div>
  );
}