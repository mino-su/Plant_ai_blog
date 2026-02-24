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

    const [profile, setProfile] = useState(null);

    // 사용자의 상세 프로필 정보를 가져오는 함수
    useEffect(() => {
        const fetchProfile = async () => {
            // 로그인 상태이고 user(ID)가 존재할 때만 실행
            if (isLoggedIn && user?.memberId) {
                try {
                    // user 변수 자체가 ID이므로 템플릿 리터럴에 직접 넣음
                    const response = await api.get(`/api/members/${user?.memberId}/profile`);
                    // 응답 받은 전체 회원 데이터를 profile 상태에 저장
                    setProfile(response.data);
                } catch (error) {
                    console.error("프로필 정보를 불러오지 못했습니다.", error);
                }
            }
        };

        fetchProfile();
    }, [isLoggedIn, user]); // isLoggedIn이나 user(ID)가 바뀌면 다시 실행

    const onLogoutClick = () => {
        handleLogout();
        setShowMenu(false);
        setProfile(null); // 로그아웃 시 데이터 비우기
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
                <BsSearch
                    size={24}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/search')} // 클릭 시 검색 페이지로 이동
                />

                {isLoggedIn ? (
                    // --- 로그인 상태일 때 ---
                    <>
                        <BsBell size={24} style={{ cursor: 'pointer' }} />
                        <Link to="/write" className="btn-primary">
                            새 글 작성
                        </Link>

                        {/* 프로필 이미지 버튼 */}
                        <button className="profile-button" onClick={toggleMenu} style={{ background: 'none', border: 'none', padding: 0 }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* fetch한 profile 상태에서 이미지 URL이 있는지 확인 */}
                                { profile?.profileImageUrl ? (
                                    <img
                                        src={`http://localhost:8080${profile.profileImageUrl}`}
                                        alt="profile"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
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