import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsSearch, BsBell } from 'react-icons/bs';
import '../App.css';

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false); // 드롭다운 메뉴 표시 상태

    // 1. 컴포넌트가 마운트될 때 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // 2. 로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setShowMenu(false);
        alert("로그아웃 되었습니다.");
        navigate('/'); // 메인으로 이동
    };

    // 3. 메뉴 토글 함수
    const toggleMenu = () => setShowMenu(!showMenu);

    return (
        <header style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="container">

            {/* 로고 영역 */}
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
                Plant.log
            </Link>

            {/* 우측 메뉴 영역 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
                <BsSearch size={24} style={{ cursor: 'pointer' }} />

                {isLoggedIn ? (
                    // --- 로그인 상태일 때 ---
                    <>
                        <BsBell size={24} style={{ cursor: 'pointer' }} />
                        <Link to="/write" className="btn-primary">
                            새 글 작성
                        </Link>

                        {/* 프로필 이미지 버튼 */}
                        <button className="profile-button" onClick={toggleMenu}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                {/* 실제 이미지가 있다면 img 태그 사용 */}
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    👤
                                </div>
                            </div>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showMenu && (
                            <div className="dropdown-menu">
                                <Link to="/mypage" className="dropdown-item" onClick={() => setShowMenu(false)}>내 페이지</Link>
                                <Link to="/setting" className="dropdown-item" onClick={() => setShowMenu(false)}>설정</Link>
                                <button className="dropdown-item" onClick={handleLogout}>로그아웃</button>
                            </div>
                        )}
                    </>
                ) : (
                    // --- 로그인 전 상태일 때 ---
                    <Link to="/login" className="btn-primary" style={{ background: '#343a40' }}>
                        로그인
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;