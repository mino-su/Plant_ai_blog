import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../FollowListPage.css';



const FollowListPage = ({ isOpen, onClose, userList = [], type, isLoggedIn, onFollowToggle }) => {
    const navigate = useNavigate();
    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";
    // [작동 원리] 페이지(모달)가 열릴 때 로그인 상태를 체크하는 로직입니다.
    useEffect(() => {
        if (isOpen && !isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            onClose();
            navigate('/login');
        }
    }, [isOpen, isLoggedIn, onClose, navigate]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    {/* type에 따라 '팔로워' 또는 '팔로잉' 제목을 동적으로 표시합니다. */}
                    <h3>{type === 'follower' ? '팔로워' : '팔로잉'} 목록</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {userList && userList.length > 0 ? (
                        userList.map((user) => (
                            <div key={user.memberId} className="user-item">
                                <div className="user-info">
                                    {user.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl.startsWith('http')
                                                ? user.profileImageUrl
                                                : `${BASE_URL}${user.profileImageUrl}`}
                                            alt={user.username}
                                            className="profile-img"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/default_profile.jpg"; // 에러 시 기본 이미지
                                            }}
                                        />
                                    ) : (
                                        /* 프로필 이미지가 아예 없을 때의 대체 아이콘 */
                                        <div className="profile-img-placeholder">🌿</div>
                                    )}
                                    {/* DTO의 username 필드를 표시합니다. */}
                                    <span className="username">{user.username}</span>
                                </div>

                                {/* [핵심 로직] isFollowing 값에 따라 버튼의 텍스트와 스타일을 다르게 보여줍니다. */}
                                <button
                                    className={`follow-btn ${user.isFollowing ? 'unfollow' : 'follow'}`}
                                    onClick={() => onFollowToggle(user.memberId, user.isFollowing)}
                                >
                                    {user.isFollowing ? '언팔로우' : '팔로우'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">목록이 비어 있습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListPage;