import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import '../App.css';

export default function MyPage() {
    const { id: memberId } = useParams(); // URL의 :id를 memberId로 사용
    const navigate = useNavigate();

    // 상태 관리
    const [data, setData] = useState(null); // 페이지 주인 정보
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [myId, setMyId] = useState(null); // 현재 로그인한 나의 ID

    useEffect(() => {
        fetchInitialData();
        // 브라우저 탭 이름 설정
        document.title = `마이페이지 - Alleaf`;
    }, [memberId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            // 1. 현재 로그인한 내 정보 가져오기 (memberId 비교용)
            // 백엔드: @GetMapping("/me") -> MemberIdResponseDto { memberId: 7 }
            const meRes = await api.get('/api/members/me');
            setMyId(meRes.data.memberId);

            // 2. 페이지 주인의 마이페이지 정보 로드
            // 백엔드: MyPageResponseDto (포스트 목록, 팔로워 수 등 포함)
            const res = await api.get(`/api/members/${memberId}/mypage`);
            setData(res.data);
            setIsFollowing(res.data.isFollowing || false);

            document.title = `${res.data.username}님의 페이지 - Alleaf`;
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 팔로우 토글 핸들러
    const handleFollowToggle = async () => {
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
            alert("요청 처리 중 오류가 발생했습니다.");
        }
    };

    // [핵심] 나인지 확인하는 로직 (숫자형 변환 주의)
    const isMe = myId === Number(memberId);

    if (loading) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--text-muted)' }}>
                알리프가 정보를 불러오고 있습니다...
            </div>
        </>
    );

    if (!data) return <div className="p-20 text-center">사용자를 찾을 수 없습니다.</div>;

    return (
        <>
            <Header />
            <main className="container">
                {/* 1. 프로필 상단 영역 */}
                <section className="mypage-header">
                    <div className="mypage-profile-img" style={{ background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
                        {data.profileImageUrl ? (
                            <img src={data.profileImageUrl} alt="profile" />
                        ) : (
                            "🌿" // 프로필 사진 없을 때 기본 아이콘
                        )}
                    </div>

                    <div className="mypage-user-info">
                        <h2>
                            {data.username}
                            <div className="mypage-actions">
                                {isMe ? (
                                    // 내 페이지일 때: 프로필 수정 버튼
                                    <button
                                        onClick={() => navigate('/setting')}
                                        className="follow-btn unfollow-btn edit-btn"
                                        style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}
                                    >
                                        프로필 수정
                                    </button>
                                ) : (
                                    // 남의 페이지일 때: 팔로우/언팔로우 버튼
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
                                    >
                                        {isFollowing ? "언팔로우" : "팔로우"}
                                    </button>
                                )}
                            </div>
                        </h2>
                        <p className="user-email">{data.email}</p>

                        <div className="mypage-stats">
                            <div className="stat-item"><span>팔로워</span><b>{data.followerCount}</b></div>
                            <div className="stat-item"><span>팔로잉</span><b>{data.followingCount}</b></div>
                        </div>
                    </div>
                </section>

                {/* 2. 탭 메뉴 */}
                <div className="mypage-tab-bar">
                    <div className="tab-active">글 ({data.postCount || 0})</div>
                </div>

                {/* 3. 게시글 목록 (PostCard 재사용) */}
                <div className="mypage-post-grid">
                    {data.posts && data.posts.length > 0 ? (
                        data.posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="empty-message">
                            아직 작성한 식물 일지가 없습니다.
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}