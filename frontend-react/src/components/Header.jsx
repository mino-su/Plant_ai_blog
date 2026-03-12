import React, { useState, useEffect } from 'react';
import { useAuth } from "./AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { BsSearch, BsBell } from 'react-icons/bs';
import '../App.css';
import api from "../api.js";

const Header = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn, handleLogout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [profile, setProfile] = useState(null);

    // 알림 관련 상태
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // [1] 프로필 및 초기 안 읽은 알림 개수 불러오기
    useEffect(() => {
        const fetchInitialData = async () => {
            if (isLoggedIn && user?.memberId) {
                try {
                    // 프로필 가져오기
                    const profileRes = await api.get(`/api/members/${user.memberId}/profile`);
                    setProfile(profileRes.data);

                    // 안 읽은 알림 개수 가져오기
                    fetchUnreadCount();
                } catch (error) {
                    console.error("초기 데이터를 불러오지 못했습니다.", error);
                }
            }
        };
        fetchInitialData();


        const handleNewNotification = () => {
            fetchUnreadCount();
        };
        window.addEventListener('newNotification', handleNewNotification);

        return () => {
            window.removeEventListener('newNotification', handleNewNotification);
        };
    }, [isLoggedIn, user]);

    // 안 읽은 알림 개수 조회 API
    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/api/notifications/notread');
            setUnreadCount(res.data.length);
        } catch (error) {
            console.error("안 읽은 알림 개수 조회 실패:", error);
        }
    };

    // [2] 전체 알림 목록 불러오기 API
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications');
            // 백엔드 DTO(NotificationDto) 구조에 맞춰 상태 업데이트
            setNotifications(response.data);
        } catch (error) {
            console.error("알림 목록 조회 실패:", error);
        }
    };

    // [3] 개별 알림 클릭 시 읽음 처리 API
    const handleNotificationClick = async (noti) => {
        // 이미 읽은 알림이면 무시
        if (noti.read || noti.isRead) {
            if (noti.type === 'like' || noti.type === 'comment') {
                navigate(`/posts/${noti.targetId}`); // 게시글 상세 페이지로
            } else if (noti.type === 'follow') {
                navigate(`/members/${noti.targetId}/mypage`); // 팔로우한 사람의 마이페이지로
            }
            return;
        }

        try {
            await api.put(`/api/notifications/${noti.id}/read`);

            // 로컬 상태 즉시 업데이트
            setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (noti.type === 'like' || noti.type === 'comment') {
                navigate(`/posts/${noti.targetId}`); // 게시글 상세 페이지로
            } else if (noti.type === 'follow') {
                navigate(`/members/${noti.targetId}/mypage`); // 팔로우한 사람의 마이페이지로
            }

        } catch (error) {
            console.error("알림 읽음 처리 실패:", error);
        }
    };

    // 종소리 클릭 핸들러
    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications(); // 열 때마다 최신 목록 조회
        }
        setShowNotifications(!showNotifications);
        setShowMenu(false);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
        setShowNotifications(false);
    };

    const onLogoutClick = () => {
        handleLogout();
        setShowMenu(false);
        setShowNotifications(false);
        setProfile(null);
        alert("로그아웃 되었습니다.");
        navigate('/');
    };

    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";


    return (
        <header style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="container">
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
                Plant.log
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
                <BsSearch size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/search')} />

                {isLoggedIn ? (
                    <>
                        {/* --- 알림 영역 시작 --- */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <BsBell size={24} style={{ cursor: 'pointer' }} onClick={toggleNotifications} />

                            {/* 안 읽은 알림 뱃지 */}
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: '#fa5252', color: 'white', fontSize: '0.7rem',
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                }}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}

                            {/* 알림 드롭다운 */}
                            {showNotifications && (
                                <div className="dropdown-menu" style={{
                                    position: 'absolute', top: '40px', right: '-80px',
                                    width: '320px', maxHeight: '400px', overflowY: 'auto',
                                    background: 'white', border: '1px solid #dee2e6', borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, padding: 0
                                }}>
                                    <h4 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #f1f3f5', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                        알림
                                        {unreadCount > 0 && <span style={{ color: '#12b886', fontSize: '0.85rem' }}>{unreadCount}개 안 읽음</span>}
                                    </h4>

                                    {notifications.length > 0 ? (
                                        notifications.map((noti) => {
                                            // Jackson 직렬화 시 isRead가 read로 넘어올 수 있으므로 둘 다 체크
                                            const isRead = noti.isRead || noti.read;
                                            return (
                                                <div
                                                    key={noti.id}
                                                    onClick={() => handleNotificationClick(noti)}
                                                    style={{
                                                        padding: '15px', borderBottom: '1px solid #f8f9fa',
                                                        cursor: 'pointer', transition: 'background 0.2s',
                                                        background: isRead ? 'white' : '#e6fcf5' // 안 읽은 알림은 옅은 민트색 배경
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = isRead ? '#f8f9fa' : '#c3fae8'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = isRead ? 'white' : '#e6fcf5'}
                                                >
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: isRead ? '#868e96' : '#212529', fontWeight: isRead ? 'normal' : '500', lineHeight: '1.4' }}>
                                                        {noti.content}
                                                    </p>
                                                    <span style={{ fontSize: '0.75rem', color: '#adb5bd', marginTop: '6px', display: 'block' }}>
                                                        {noti.createdAt}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '40px 15px', textAlign: 'center', color: '#868e96', fontSize: '0.9rem' }}>
                                            새로운 알림이 없습니다. 🌱
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* --- 알림 영역 끝 --- */}

                        <Link to="/write" className="btn-primary">새 글 작성</Link>

                        <button className="profile-button" onClick={toggleMenu} style={{ background: 'none', border: 'none', padding: 0 }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                { profile?.profileImageUrl ? (
                                    <img src={`${BASE_URL}${profile.profileImageUrl}`} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : "👤"}
                            </div>
                        </button>

                        {showMenu && (
                            <div className="dropdown-menu" style={{ position: 'absolute', top: '40px', right: 0, zIndex: 1000 }}>
                                <Link to={`/members/${user?.memberId}/mypage`} className="dropdown-item" onClick={() => setShowMenu(false)}>내 페이지</Link>
                                <Link to="/setting" className="dropdown-item" onClick={() => setShowMenu(false)}>설정</Link>
                                <button className="dropdown-item" onClick={onLogoutClick}>로그아웃</button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/login" className="btn-primary" style={{ background: '#343a40' }}>로그인</Link>
                )}
            </div>
        </header>
    );
};

export default Header;