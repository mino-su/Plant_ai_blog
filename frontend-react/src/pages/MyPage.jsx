
import React, { useEffect, useState } from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api'; // 커스텀 Axios 인스턴스
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import '../App.css';
import FollowListPage from "./FollowListPage";

export default function MyPage() {
    // 1. URL 파라미터 및 네비게이션 설정
    const { memberId } = useParams();
    const navigate = useNavigate();

    // 2. 상태 관리
    const [data, setData] = useState(null); // 마이페이지 기본 데이터 (작성글, 통계 등)
    const [profile, setProfile] = useState({
        bio: "",
        websiteUrl: "",
        profileImageUrl: ""
    }); // 프로필 상세 데이터

    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [myId, setMyId] = useState(null); // 현재 로그인한 사람의 ID

    const [showModal, setShowModal] = useState(false); // 모달 열림 여부
    const [modalType, setModalType] = useState('follower'); // 'follower' 또는 'following'
    const [modalUserList, setModalUserList] = useState([]); // 모달에 띄울 유저 목록
    const [activeTab, setActiveTab] = useState('written');

    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";

    // 3. 권한 판별 변수 (중요!)
    const isLoggedIn = myId !== null; // 현재 로그인 상태인가?
    const isMe = isLoggedIn && Number(myId) === Number(memberId); // 본인 페이지인가?

    useEffect(() => {
        // memberId가 유효하지 않으면 실행하지 않음
        if (!memberId || memberId === 'undefined') return;
        fetchAllData();
    }, [memberId]);

    // 4. 데이터 로딩 로직
    const fetchAllData = async () => {
        try {
            setLoading(true);

            // [로직 1] 로그인 정보 확인 (토큰이 있을 때만 시도)
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const meRes = await api.get('/api/members/me');
                    // 서버 응답이 ID 숫자 하나라면 meRes.data, 객체라면 meRes.data.id 등으로 맞추세요.
                    setMyId(meRes.data.memberId);
                } catch (e) {
                    console.log("비로그인 또는 만료된 세션입니다.");
                    setMyId(null);
                }
            } else {
                setMyId(null);
            }

            // [로직 2] 공개 데이터 조회 (병렬 처리)
            // 백엔드 SecurityConfig에서 아래 두 경로는 permitAll()이어야 합니다.
            const [mypageRes, profileRes] = await Promise.all([
                api.get(`/api/members/${memberId}/mypage`),
                api.get(`/api/members/${memberId}/profile`)
            ]);

            const myPageData = mypageRes.data;

            setData(myPageData);
            setProfile(profileRes.data);


            setIsFollowing(myPageData.isFollowing);

            document.title = `${mypageRes.data.username}님의 정원 | Alleaf`;

        } catch (err) {
            console.error("데이터 로드 중 에러 발생:", err);
            // 403 에러 등이 여기서 잡히면 백엔드 Security 설정을 다시 확인해야 합니다.
        } finally {
            setLoading(false);
        }
    };

    // 5. 팔로우 토글 핸들러 (isLoggedIn 활용)
    const handleFollowToggle = async () => {
        // 비로그인 유저가 팔로우를 누르면 로그인 유도
        if (!isLoggedIn) {
            if (window.confirm("팔로우는 로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
                navigate('/login');
            }
            return;
        }

        try {
            if (isFollowing) {
                await api.delete(`/api/members/${memberId}/follow`);
                setData(prev => ({ ...prev, followerCount: prev.followerCount - 1 }));
            } else {
                await api.post(`/api/members/${memberId}/follow`);
                setData(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            alert("요청 처리에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    const openFollowModal = async (type) => {
        setModalType(type);
        try {
            const endpoint = type === 'follower' ? 'followers' : 'followings';
            const res = await api.get(`/api/members/${memberId}/${endpoint}`);
            setModalUserList(res.data); // 서버에서 받은 FollowListResponseDto 리스트 저장
            setShowModal(true);
        } catch (err) {
            console.error("목록을 불러오는데 실패했습니다.", err);
        }
    };

    // 모달 안에서 팔로우 버튼을 눌렀을 때 처리
    const handleFollowToggleInModal = async (targetMemberId, currentIsFollowing) => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        try {
            if (currentIsFollowing) {
                await api.delete(`/api/members/${targetMemberId}/follow`);
            } else {
                await api.post(`/api/members/${targetMemberId}/follow`);
            }

            // 리스트 상태 업데이트: 해당 유저의 isFollowing 값만 반전시킴
            setModalUserList(prev => prev.map(user =>
                user.memberId === targetMemberId ? { ...user, isFollowing: !currentIsFollowing } : user
            ));
        } catch (err) {
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    // 로딩 처리
    if (loading) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '10rem', color: '#868e96' }}>
                식물 정보를 불러오고 있습니다... 🌱
            </div>
        </>
    );

    // 데이터가 없을 때 처리
    if (!data) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '10rem' }}>
                존재하지 않는 사용자입니다.
            </div>
        </>
    );

    return (
        <>
            <Header />
            <main className="container" style={{ paddingBottom: '5rem' }}>
                {/* 상단 프로필 섹션 */}
                <section className="mypage-header">
                    <div className="mypage-profile-img" style={{
                        background: '#f1f3f5',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        width: '150px',
                        height: '150px'
                    }}>
                        {profile.profileImageUrl ? (
                            <img
                                src={`${BASE_URL}${profile.profileImageUrl}`}
                                alt="profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default_profile.jpg";
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '3.5rem' }}>🌿</span>
                        )}
                    </div>

                    <div className="mypage-user-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: 0 }}>{data.username}</h2>

                            {/* [권한 제어 1] 본인일 때만 수정 버튼 노출 */}
                            {isMe && (
                                <button onClick={() => navigate('/setting')} className="edit-btn">
                                    프로필 수정
                                </button>
                            )}
                        </div>

                        <div className="user-profile-details" style={{ marginTop: '1rem' }}>
                            <p className="user-bio" style={{ fontSize: '1.1rem', color: '#495057', margin: '0 0 0.5rem 0' }}>
                                {profile.bio || "반려 식물과 함께하는 일상을 소개해 보세요!"}
                            </p>
                            {profile.websiteUrl && (
                                <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `${BASE_URL}${profile.websiteUrl}`}
                                   target="_blank" rel="noopener noreferrer"
                                   style={{ color: '#12b886', textDecoration: 'none', fontSize: '0.9rem' }}>
                                    🔗 {profile.websiteUrl}
                                </a>
                            )}
                        </div>

                        {/* [권한 제어 2] 타인 페이지이거나 비로그인일 때 팔로우 버튼 노출 */}
                        {!isMe && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
                                >
                                    {isFollowing ? "언팔로우" : "팔로우"}
                                </button>
                                {!isLoggedIn && (
                                    <span style={{ fontSize: '0.8rem', color: '#adb5bd' }}>
                                        (로그인 후 가능)
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="mypage-stats">
                            {/* [수정 포인트] Link를 div/span으로 바꾸고 onClick 연결 */}
                            <div
                                onClick={() => openFollowModal('follower')}
                                className="stat-item"
                                style={{ cursor: 'pointer' }}
                            >
                                <span>팔로워</span> <b>{data.followerCount}</b>
                            </div>
                            <div
                                onClick={() => openFollowModal('following')}
                                className="stat-item"
                                style={{ cursor: 'pointer' }}
                            >
                                <span>팔로잉</span> <b>{data.followingCount}</b>
                            </div>
                        </div>
                    </div>
                </section>

                <FollowListPage
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    userList={modalUserList}
                    type={modalType}
                    isLoggedIn={isLoggedIn}
                    onFollowToggle={handleFollowToggleInModal}
                />

                <div className="mypage-tab-bar" style={{
                    display: 'flex',
                    gap: '2rem',
                    marginTop: '3rem',
                    borderBottom: '1px solid #dee2e6'
                }}>
                    <div
                        onClick={() => setActiveTab('written')}
                        style={{
                            padding: '1rem 0',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'written' ? '2px solid #12b886' : '2px solid transparent',
                            color: activeTab === 'written' ? '#12b886' : '#868e96',
                            fontWeight: activeTab === 'written' ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        작성한 일지 ({data.posts?.length || 0})
                    </div>

                    {/* 타인의 마이페이지에서는 '좋아요한 일지'를 숨기고 싶다면 여기에 isMe && 를 추가하세요! */}
                    <div
                        onClick={() => setActiveTab('liked')}
                        style={{
                            padding: '1rem 0',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'liked' ? '2px solid #12b886' : '2px solid transparent',
                            color: activeTab === 'liked' ? '#12b886' : '#868e96',
                            fontWeight: activeTab === 'liked' ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        좋아요한 일지 ({data.likePosts?.length || 0})
                    </div>
                </div>

                {/* 조건부 렌더링: 선택된 탭에 따라 다른 그리드를 렌더링 */}
                <div className="mypage-post-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginTop: '2rem'
                }}>
                    {/* '작성한 일지' 탭이 활성화되었을 때 */}
                    {activeTab === 'written' && (
                        data.posts && data.posts.length > 0 ? (
                            data.posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: '#adb5bd' }}>
                                아직 작성된 일지가 없습니다. 🍃
                            </div>
                        )
                    )}

                    {/* '좋아요한 일지' 탭이 활성화되었을 때 */}
                    {activeTab === 'liked' && (
                        data.likePosts && data.likePosts.length > 0 ? (
                            data.likePosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: '#adb5bd' }}>
                                아직 좋아요를 누른 일지가 없습니다. 🍃
                            </div>
                        )
                    )}
                </div>
            </main>
        </>
    );
}