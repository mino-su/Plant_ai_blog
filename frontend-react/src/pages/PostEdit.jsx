import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api';
import '../App.css'; // 버튼 스타일(btn-primary) 등 공통 CSS

function PostEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:8080"; // 이미지 경로용

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // 이미지 관리 State
    const [existingImages, setExistingImages] = useState([]); // 서버에서 불러온 기존 이미지
    const [deleteImageIds, setDeleteImageIds] = useState([]); // 삭제할 이미지 ID 목록
    const [newFiles, setNewFiles] = useState([]); // 새로 추가할 파일 객체들

    useEffect(() => {
        fetchPost();
    }, []);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/api/posts/${id}`);
            setTitle(res.data.title);
            setContent(res.data.content);
            // 서버 응답 필드명이 imgUrl 인지 imageUrl 인지 확인 필요 (여기선 imgUrl 가정)
            setExistingImages(res.data.images || []);
        } catch (err) {
            console.error(err);
            alert("데이터를 불러오지 못했습니다.");
            navigate(-1); // 뒤로 가기
        }
    };

    // 기존 이미지 삭제 (UI에서 숨기고 ID 저장)
    const handleDeleteExistingImage = (imgId) => {
        setDeleteImageIds([...deleteImageIds, imgId]); // 삭제할 ID 리스트에 추가
        setExistingImages(existingImages.filter(img => img.id !== imgId)); // 화면 목록에서 제거
    };

    const handleNewFileChange = (e) => {
        if (e.target.files) {
            setNewFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();

        // 1. JSON 데이터 (수정된 내용 + 삭제할 이미지 ID들)
        const jsonBody = {
            title: title,
            content: content,
            deleteImageIds: deleteImageIds // 예: [1, 5]
        };

        formData.append(
            "post",
            new Blob([JSON.stringify(jsonBody)], { type: "application/json" })
        );

        // 2. 새로 추가할 파일들
        newFiles.forEach(file => {
            formData.append("image", file);
        });

        try {
            // Content-Type 헤더 제거 (Axios 자동 설정 권장)
            await api.put(`/api/posts/${id}`, formData);

            alert("수정이 완료되었습니다!");
            navigate(`/posts/${id}`); // 수정된 상세 페이지로 이동
        } catch (err) {
            console.error(err);
            alert("수정 실패: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* --- 왼쪽: 에디터 영역 --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>

                {/* 제목 입력 */}
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ fontSize: '2.5rem', border: 'none', outline: 'none', fontWeight: 'bold', marginBottom: '1rem', width: '100%' }}
                />

                <div style={{ width: '100%', height: '4px', background: 'rgb(73, 80, 87)', marginBottom: '2rem' }}></div>

                {/* --- 이미지 관리 영역 시작 --- */}
                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '0.5rem' }}>📷 이미지 관리</h4>

                    {/* 1. 기존 이미지 목록 */}
                    {existingImages.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {existingImages.map(img => (
                                <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    <img
                                        src={`${BASE_URL}${img.imgUrl || img.imageUrl}`} // 필드명 방어코드
                                        alt="existing"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    {/* 삭제 버튼 (X) */}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteExistingImage(img.id)}
                                        style={{
                                            position: 'absolute', top: -5, right: -5,
                                            background: '#fa5252', color: 'white',
                                            border: 'none', borderRadius: '50%',
                                            width: '20px', height: '20px',
                                            fontSize: '12px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. 새 이미지 추가 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label className="btn-primary" style={{ background: '#868e96', fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                            + 새 이미지 추가
                            <input type="file" multiple onChange={handleNewFileChange} style={{ display: 'none' }} />
                        </label>
                        <span style={{ fontSize: '0.8rem', color: '#12b886' }}>
                    {newFiles.length > 0 ? `${newFiles.length}개의 새 파일 선택됨` : ""}
                </span>
                    </div>
                </div>
                {/* --- 이미지 관리 영역 끝 --- */}

                {/* 본문 에디터 */}
                <textarea
                    style={{ flex: 1, border: 'none', resize: 'none', outline: 'none', fontSize: '1.125rem', fontFamily: 'monospace', minHeight: '300px' }}
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {/* 하단 버튼 */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                        ← 나가기
                    </button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        수정 완료
                    </button>
                </div>
            </div>

            {/* --- 오른쪽: 미리보기 영역 --- */}
            <div style={{ flex: 1, background: '#fbfdfc', padding: '2rem', overflowY: 'auto', borderLeft: '1px solid #eee' }}>
                <h2 style={{color: '#868e96', marginBottom: '2rem'}}>미리보기</h2>
                <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default PostEdit;