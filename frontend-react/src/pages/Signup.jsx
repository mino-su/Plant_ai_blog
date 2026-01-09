import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Signup() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      alert("가입 성공! 로그인해주세요.");
      navigate('/login');
    } catch (error) {
      alert("가입 실패: " + (error.response?.data?.message || "오류 발생"));
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input name="email" type="email" placeholder="이메일" onChange={handleChange} required />
        <input name="username" type="text" placeholder="이름" onChange={handleChange} required />
        <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} required />
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
}

export default Signup;
