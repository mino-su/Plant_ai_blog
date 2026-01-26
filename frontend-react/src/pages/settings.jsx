import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import '../App.css';

const Setting = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        bio: "",           // null 대신 ""
        websiteUrl: "",    // null 대신 ""
        profileImageUrl: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const myId = localStorage.getItem('userId');
            const res = await api.get(`/api/members/${myId}/profile`);

            // [여기입니다!] res.data의 값을 그대로 넣지 말고,
            // null이나 undefined면 빈 문자열("")로 바꿔서 저장하세요.
            setProfile({
                bio: res.data.bio ?? "",            // null이면 "" 대입
                websiteUrl: res.data.websiteUrl ?? "", // null이면 "" 대입
                profileImageUrl: res.data.profileImageUrl ?? ""
            });
        } catch (err) {
            console.error("프로필 로드 실패", err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 미리보기 생성
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // ProfileRequestDto 부분 (Blob으로 감싸서 JSON 타입 명시)
        const requestDto = {
            bio: profile.bio,
            websiteUrl: profile.websiteUrl
        };
        formData.append("profile", new Blob([JSON.stringify(requestDto)], { type: "application/json" }));

        // 이미지 파일 추가
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            await api.put('/api/members/me/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("프로필이 성공적으로 수정되었습니다.");
            navigate(-1); // 마이페이지로 복귀
        } catch (err) {
            console.error("수정 실패", err);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <Header />
            <main className="container auth-wrapper">
                <div className="auth-box" style={{ maxWidth: '500px' }}>
                    <h2 className="auth-title">프로필 설정</h2>
                    <form onSubmit={handleSubmit}>
                        {/* 이미지 업로드 섹션 생략 */}

                        <label>한 줄 소개</label>
                        <textarea
                            className="styled-input"
                            style={{ height: '100px', padding: '10px' }}
                            // [중요!] 그냥 profile.bio라고 쓰지 말고 뒤에 ?? "" 를 꼭 붙여주세요.
                            value={profile.bio ?? ""}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            placeholder="나를 소개해주세요."
                        />

                        {/* 2. 웹사이트 (input) */}
                        <label>웹사이트</label>
                        <input
                            className="styled-input"
                            // [중요!] 여기도 마찬가지로 ?? "" 를 붙입니다.
                            value={profile.websiteUrl ?? ""}
                            onChange={(e) => setProfile({...profile, websiteUrl: e.target.value})}
                            placeholder="https://your-link.com"
                        />

                        <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                            <button type="button" className="btn-primary" style={{ background: 'var(--border-color)', color: 'var(--text-main)', flex: 1 }} onClick={() => navigate(-1)}>취소</button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>저장하기</button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Setting;