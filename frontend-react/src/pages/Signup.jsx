import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import '../App.css'; // 공통 스타일 적용

function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // 간단한 유효성 검사 (선택 사항)
        if (formData.password.length < 4) {
            alert("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        try {
            await api.post('/auth/signup', formData);
            alert("가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
            navigate('/login');
        } catch (error) {
            // 서버에서 보내주는 에러 메시지가 있다면 그걸 보여주고, 없으면 기본 메시지
            const msg = error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                {/* 상단 로고 (클릭 시 메인으로 이동) */}
                <Link to="/" style={{ textDecoration: 'none', textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#12b886' }}>Plant.log</span>
                </Link>

                <h2 className="auth-title">회원가입</h2>

                <form onSubmit={handleSignup}>
                    {/* 이메일 입력 */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#868e96' }}>이메일</label>
                        <input
                            className="styled-input"
                            name="email"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 이름(닉네임) 입력 */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#868e96' }}>이름</label>
                        <input
                            className="styled-input"
                            name="username"
                            type="text"
                            placeholder="사용하실 이름을 입력하세요"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#868e96' }}>비밀번호</label>
                        <input
                            className="styled-input"
                            name="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 가입 버튼 */}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', height: '3rem', fontSize: '1rem', marginTop: '0.5rem' }}
                    >
                        회원가입
                    </button>
                </form>

                {/* 하단 링크 */}
                <div className="auth-footer">
                    이미 계정이 있으신가요?
                    <Link to="/login">로그인</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;