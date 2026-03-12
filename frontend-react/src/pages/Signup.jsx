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
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            await api.post('/auth/signup', formData);
            alert("가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
            navigate('/login');
        } catch (error) {
            const data = error.response?.data;

            // 필드별 에러가 있으면 인라인 표시
            if (data?.fieldErrors?.length > 0) {
                const errors = {};
                data.fieldErrors.forEach(({ field, message }) => {
                    errors[field] = message;
                });
                setFieldErrors(errors);
            } else {
                // 일반 에러(잘못된 로그인 등)는 alert
                const msg = data?.message || "아이디나 비밀번호를 확인해주세요.";
                alert(msg);
            }
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

                <form onSubmit={handleSignup} noValidate>
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

                        {fieldErrors.email && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                {fieldErrors.email}
                            </span>
                        )}
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
                        {fieldErrors.username && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                {fieldErrors.username}
                            </span>
                        )}

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
                        {fieldErrors.password && (
                            <span style={{ color: 'red', fontSize: '12px' }}>
                                {fieldErrors.password}
                            </span>
                        )}
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