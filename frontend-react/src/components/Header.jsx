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
        <header className="site-header">
            <div className="container">
                <Link to="/" className="header-logo">Alleaf 🪴</Link>

                <div className="header-right">
                    <BsSearch size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/search')} />

                    {isLoggedIn ? (
                        <>
                            {/* 알림 */}
                            <div className="notif-wrapper">
                                <BsBell size={24} style={{ cursor: 'pointer' }} onClick={toggleNotifications} />
                                {unreadCount > 0 && (
                                    <span className="notif-badge">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                                )}
                                {showNotifications && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            알림
                                            {unreadCount > 0 && (
                                                <span className="notif-count">{unreadCount}개 안 읽음</span>
                                            )}
                                        </div>
                                        {notifications.length > 0 ? (
                                            notifications.map((noti) => {
                                                const isRead = noti.isRead || noti.read;
                                                return (
                                                    <div
                                                        key={noti.id}
                                                        className={`notif-item ${isRead ? '' : 'unread'}`}
                                                        onClick={() => handleNotificationClick(noti)}
                                                    >
                                                        <p className={`notif-text ${isRead ? '' : 'unread'}`}>
                                                            {noti.content}
                                                        </p>
                                                        <span className="notif-date">{noti.createdAt}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="notif-empty">새로운 알림이 없습니다. 🌱</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link to="/write" className="btn-primary">새 글 작성</Link>

                            <button className="profile-button" onClick={toggleMenu}>
                                <div className="profile-avatar">
                                    {profile?.profileImageUrl ? (
                                        <img src={`${BASE_URL}${profile.profileImageUrl}`} alt="profile" />
                                    ) : "👤"}
                                </div>
                            </button>

                            {showMenu && (
                                <div className="dropdown-menu">
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
            </div>
        </header>
    );
};

export default Header;