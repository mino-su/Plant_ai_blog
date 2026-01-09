import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // 토큰 저장
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      alert("로그인 성공!");
      navigate('/'); // 메인으로 이동
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("로그인 실패: 아이디나 비번을 확인하세요.");
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">로그인</button>
      </form>
      <p>계정이 없나요? <Link to="/signup">회원가입</Link></p>
    </div>
  );
}

export default Login;
