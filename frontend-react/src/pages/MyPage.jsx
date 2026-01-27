import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import '../App.css';

export default function MyPage() {
    // 1. URL 파라미터에서 memberId 추출
    const { memberId } = useParams();
    const navigate = useNavigate();

    // 2. 상태 관리 (myId 선언 포함)
    const [data, setData] = useState(null);
    const [profile, setProfile] = useState({
        bio: "",
        websiteUrl: "",
        profileImageUrl: ""
    });
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [myId, setMyId] = useState(null); // 로그인한 사용자의 ID 저장

    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        if (!memberId || memberId === 'undefined') return;
        fetchAllData();
    }, [memberId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // 로그인 정보 가져오기 (본인 확인용)
            try {
                const meRes = await api.get('/api/members/me');
                setMyId(meRes.data.memberId);
            } catch (e) {
                console.log("비로그인 상태입니다.");
            }

            // 마이페이지 & 프로필 병렬 호출
            const [mypageRes, profileRes] = await Promise.all([
                api.get(`/api/members/${memberId}/mypage`),
                api.get(`/api/members/${memberId}/profile`)
            ]);

            setData(mypageRes.data);
            setProfile(profileRes.data);
            setIsFollowing(mypageRes.data.isFollowing || false);

            document.title = `${mypageRes.data.username}님의 정원`;
        } catch (err) {
            console.error("로드 실패:", err);
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
            alert("요청 실패");
        }
    };

    // [핵심] 본인 여부 확인
    const isMe = myId !== null && Number(myId) === Number(memberId);

    if (loading) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '10rem', color: '#868e96' }}>
                식물 정보를 불러오고 있습니다... 🌱
            </div>
        </>
    );

    if (!data) return <div className="p-20 text-center">사용자를 찾을 수 없습니다.</div>;

    return (
        <>
            <Header />
            <main className="container">
                <section className="mypage-header">
                    <div className="mypage-profile-img" style={{ background: '#f1f3f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl.startsWith('http') ? profile.profileImageUrl : `${BASE_URL}${profile.profileImageUrl}`}
                                alt="profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default_profile.jpg"; // 프론트의 public 폴더 내 대체 이미지
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '3.5rem' }}>🌿</span>
                        )}
                    </div>

                    <div className="mypage-user-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: 0 }}>{data.username}</h2>
                            {isMe && <button onClick={() => navigate('/setting')} className="edit-btn">프로필 수정</button>}
                        </div>

                        <div className="user-profile-details" style={{ marginTop: '1rem' }}>
                            <p className="user-bio" style={{ fontSize: '1.1rem', color: '#495057', margin: '0 0 0.5rem 0' }}>
                                {profile.bio || "반려 식물과 함께하는 일상을 소개해 보세요!"}
                            </p>
                            {profile.websiteUrl && (
                                <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: '#12b886', textDecoration: 'none', fontSize: '0.9rem' }}>
                                    🔗 {profile.websiteUrl}
                                </a>
                            )}
                        </div>

                        {!isMe && (
                            <button onClick={handleFollowToggle} className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`} style={{ marginTop: '1rem' }}>
                                {isFollowing ? "언팔로우" : "팔로우"}
                            </button>
                        )}

                        <div className="mypage-stats" style={{ marginTop: '1.5rem' }}>
                            <div className="stat-item"><span>팔로워</span><b>{data.followerCount}</b></div>
                            <div className="stat-item"><span>팔로잉</span><b>{data.followingCount}</b></div>
                        </div>
                    </div>
                </section>

                <div className="mypage-tab-bar" style={{ marginTop: '3rem', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ padding: '1rem 0', borderBottom: '2px solid #12b886', color: '#12b886', fontWeight: 'bold' }}>
                        작성한 일지 ({data.postCount || 0})
                    </div>
                </div>

                <div className="mypage-post-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                    {data.posts?.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
            </main>
        </>
    );
}