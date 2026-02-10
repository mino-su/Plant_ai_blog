import React, { useState, useEffect } from 'react';
import {useAuth} from "./AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { BsSearch, BsBell } from 'react-icons/bs';
import '../App.css';
import api from "../api.js";

const Header = () => {
    const navigate = useNavigate();
    const {user, isLoggedIn, handleLogout} = useAuth();
    const [showMenu, setShowMenu] = useState(false); // 드롭다운 메뉴 표시 상태


    const onLogoutClick = () => {
        handleLogout();
        setShowMenu(false);
        alert("로그아웃 되었습니다.");
        navigate('/');
    };

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
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eee', overflow: 'hidden', justifyContent:'center'}}>
                                { user?.profileImageUrl ? (
                                    <img src = {`http://localhost:8080${user.profileImageUrl}`} />
                                ) : "👤"}
                            </div>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showMenu && (
                            <div className="dropdown-menu">
                                <Link to={`/members/${user?.memberId}/mypage`}
                                      className="dropdown-item"
                                      onClick={() => setShowMenu(false)}>내 페이지</Link>

                                <Link to="/setting"
                                      className="dropdown-item"
                                      onClick={() => setShowMenu(false)}>설정</Link>
                                <button className="dropdown-item"
                                        onClick={onLogoutClick}>로그아웃</button>
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