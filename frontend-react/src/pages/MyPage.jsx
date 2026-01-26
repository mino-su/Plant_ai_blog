import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import '../App.css';

export default function MyPage() {
    const { id: memberId } = useParams();
    const navigate = useNavigate();

    // 상태 관리
    const [data, setData] = useState(null);       // 게시글, 팔로워 등 (mypage API)
    const [profile, setProfile] = useState({
        bio: "",           // null 대신 ""
        websiteUrl: "",    // null 대신 ""
        profileImageUrl: ""
    });// bio, websiteUrl, 이미지 (profile API)
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [myId, setMyId] = useState(null);

    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchAllData();
    }, [memberId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // 1. 내 정보 가져오기 (비교용)
            const meRes = await api.get('/api/members/me');
            setMyId(meRes.data.memberId);

            // 2. [핵심] 병렬로 두 API 호출 (마이페이지 정보 + 프로필 상세 정보)
            const [mypageRes, profileRes] = await Promise.all([
                api.get(`/api/members/${memberId}/mypage`),
                api.get(`/api/members/${memberId}/profile`) // 렌지님이 알려주신 컨트롤러 주소
            ]);

            setData(mypageRes.data);
            setProfile(profileRes.data);
            setIsFollowing(mypageRes.data.isFollowing || false);

            document.title = `${mypageRes.data.username}님의 페이지 - Alleaf`;
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    };

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

    const isMe = myId === Number(memberId);

    if (loading) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--text-muted)' }}>
                식물 집사의 정보를 불러오는 중... 🌱
            </div>
        </>
    );

    if (!data || !profile) return <div className="p-20 text-center">사용자를 찾을 수 없습니다.</div>;

    return (
        <>
            <Header />
            <main className="container">
                <section className="mypage-header">
                    {/* 프로필 이미지 (ProfileResponseDto의 경로 사용) */}
                    <div className="mypage-profile-img" style={{ background: 'var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl.startsWith('http') ? profile.profileImageUrl : `${BASE_URL}${profile.profileImageUrl}`}
                                alt="profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{ fontSize: '3.5rem' }}>🌿</span>
                        )}
                    </div>

                    <div className="mypage-user-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: 0 }}>
                                {data.username}
                            </h2>
                            {isMe && (
                                <button onClick={() => navigate('/setting')} className="edit-btn">
                                    프로필 수정
                                </button>
                            )}
                        </div>

                        {/* [수정 완료] ProfileResponseDto에서 가져온 bio와 websiteUrl */}
                        <div className="user-profile-details" style={{ marginTop: '1rem' }}>
                            <p className="user-bio" style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                                {profile.bio || "아직 소개글이 없습니다. 반려 식물 이야기를 채워보세요!"}
                            </p>

                            {profile.websiteUrl && (
                                <a
                                    href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#12b886', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    🔗 {profile.websiteUrl}
                                </a>
                            )}
                        </div>

                        {!isMe && (
                            <button
                                onClick={handleFollowToggle}
                                className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
                                style={{ marginTop: '1rem' }}
                            >
                                {isFollowing ? "언팔로우" : "팔로우"}
                            </button>
                        )}

                        <div className="mypage-stats" style={{ marginTop: '1.5rem' }}>
                            <div className="stat-item"><span>팔로워</span><b>{data.followerCount}</b></div>
                            <div className="stat-item"><span>팔로잉</span><b>{data.followingCount}</b></div>
                        </div>
                    </div>
                </section>

                <div className="mypage-tab-bar">
                    <div className="tab-active">글 ({data.postCount || 0})</div>
                </div>

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