import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import '../App.css';

/**
 * [프로필 설정 페이지 완성본]
 * 1. 기존 이미지 표시: 서버에서 가져온 profileImageUrl을 BASE_URL과 결합하여 보여줍니다.
 * 2. 실시간 미리보기: 사진 선택 시 URL.createObjectURL을 통해 즉시 화면에 반영합니다.
 * 3. FormData 전송: JSON 데이터(Blob)와 이미지 파일(Multipart)을 함께 서버로 보냅니다.
 */
const Setting = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: "",
        bio: "",
        websiteUrl: "",
        profileImageUrl: ""
    });
    const [imageFile, setImageFile] = useState(null); // 실제 서버로 보낼 파일 객체
    const [previewUrl, setPreviewUrl] = useState(''); // 브라우저용 미리보기 URL

    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const myId = localStorage.getItem('userId');
            const res = await api.get(`/api/members/${myId}/profile`);

            setProfile({
                username:res.data.username ?? "",
                bio: res.data.bio ?? "",
                websiteUrl: res.data.websiteUrl ?? "",
                profileImageUrl: res.data.profileImageUrl ?? ""
            });
        } catch (err) {
            console.error("프로필 로드 실패", err);
        }
    };

    // 사진 선택 시 실행되는 함수
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 브라우저 메모리에 임시 URL 생성
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // 1. 프로필 텍스트 정보 (JSON Blob 처리)
        const requestDto = {
            username: profile.username,
            bio: profile.bio,
            websiteUrl: profile.websiteUrl
        };
        formData.append("profile", new Blob([JSON.stringify(requestDto)], { type: "application/json" }));

        // 2. 이미지 파일 추가 (선택했을 경우에만)
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            await api.put('/api/members/me/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("프로필이 성공적으로 수정되었습니다! ✨");
            navigate(-1); // 이전 마이페이지로 이동
        } catch (err) {
            console.error("수정 실패", err);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    // 이미지 태그의 src 결정 로직
    const getDisplayImage = () => {
        if (previewUrl) return previewUrl; // 새로 선택한 사진이 1순위
        if (profile.profileImageUrl) {
            // 기존 서버 사진이 2순위 (경로 결합 필요)
            return profile.profileImageUrl.startsWith('http')
                ? profile.profileImageUrl
                : `${BASE_URL}${profile.profileImageUrl}`;
        }
        return null; // 사진이 없으면 3순위 (아이콘 표시)
    };

    return (
        <>
            <Header />
            <main className="container auth-wrapper">
                <div className="auth-box" style={{ maxWidth: '500px', padding: '2rem' }}>
                    <h2 className="auth-title">프로필 설정</h2>

                    <form onSubmit={handleSubmit}>
                        {/* --- 이미지 업로드 섹션 (수정됨) --- */}
                        <div className="setting-profile-upload" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div className="mypage-profile-img" style={{
                                margin: '0 auto 1rem',
                                background: '#f1f3f5',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #eee'
                            }}>
                                {getDisplayImage() ? (
                                    <img src={getDisplayImage()} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem' }}>🌿</span>
                                )}
                            </div>

                            <label htmlFor="profile-upload" className="edit-btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                사진 변경
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {/* ----------------------------- */}

                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>닉네임</label>
                            <textarea
                                className="styled-input"
                                style={{ height: '50px', padding: '12px', resize: 'none' }}
                                value={profile.username}
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                placeholder="닉네임을 작성해주세요."
                            />
                        </div>


                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>한 줄 소개</label>
                            <textarea
                                className="styled-input"
                                style={{ height: '100px', padding: '12px', resize: 'none' }}
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                placeholder="나와 나의 반려 식물을 소개해주세요."
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>웹사이트</label>
                            <input
                                className="styled-input"
                                type="text"
                                value={profile.websiteUrl}
                                onChange={(e) => setProfile({...profile, websiteUrl: e.target.value})}
                                placeholder="블로그나 인스타그램 주소 (https://...)"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ background: '#e9ecef', color: '#495057', flex: 1 }}
                                onClick={() => navigate(-1)}
                            >
                                취소
                            </button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                저장하기
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Setting;