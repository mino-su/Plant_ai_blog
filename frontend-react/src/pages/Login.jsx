import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {useAuth} from "../components/AuthContext.jsx";
import api from '../api';
import '../App.css'; // 스타일 적용

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const {loginSuccess} = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });

            // 토큰 저장
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // 사용자 경험을 위해 바로 이동하기보다 살짝 알림
            alert("로그인 성공!");
            loginSuccess(response.data.accessToken);
            navigate('/');
        } catch (error) {
            // 에러 메시지가 서버에서 오면 그것을 보여주고, 아니면 기본 메시지
            const msg = error.response?.data?.message || "아이디나 비밀번호를 확인해주세요.";
            alert(msg);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                {/* 로고 클릭 시 홈으로 이동 */}
                <Link to="/" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#12b886' }}>Plant.log</span>
                </Link>

                <h2 className="auth-title">로그인</h2>

                <form onSubmit={handleLogin}>
                    <input
                        className="styled-input"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="styled-input"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* 버튼은 기존 App.css에 정의된 btn-primary 사용하되 너비 100% 추가 */}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem', height: '3rem', fontSize: '1rem' }}
                    >
                        로그인
                    </button>
                </form>

                <div className="auth-footer">
                    아직 회원이 아니신가요?
                    <Link to="/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;