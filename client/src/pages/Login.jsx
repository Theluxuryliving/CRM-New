// /client/src/pages/Login.jsx
import React, { useEffect } from 'react';

const Login = () => {
  useEffect(() => {
    console.log('🔐 Login.jsx loaded');
  }, []);

  return (
    <div style={{ padding: '2rem', fontSize: '24px' }}>
      ✅ Login Page is Rendering!
    </div>
  );
};

export default Login;
