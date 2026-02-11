import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api'; // 공통 API 모듈
import Header from "../components/Header";
import '../App.css';
import {useAuth} from "../components/AuthContext.jsx";

const BASE_URL = "http://localhost:8080";

function AnalysisImageBlock({ imageInfo }) {
    const [result, setResult] = useState({
        status: "PENDING",
        plantNameKr: "",
        plantDescription: "",
        diseaseNameKr: "",
        diseaseConfidence: 0,
        symptoms: "",
        solutions: "",
        prevention: "",
        dangerLevel: "",
        loading: true // 초기값은 true
    });

    useEffect(() => {
        const runAnalysis = async () => {
            try {
                // 1. 여기서 setResult를 사용하여 로딩 시작을 알립니다.
                setResult(prev => ({ ...prev, loading: true }));

                const res = await api.get(`/api/posts/images/${imageInfo.id}/analyze`);

                // 2. 백엔드 DTO와 필드명을 1:1로 맞춥니다.
                setResult({
                    ...res.data,
                    loading: false
                });
            } catch (err) {
                console.error("AI 분석 실패:", err);
                setResult(prev => ({
                    ...prev,
                    status: "FAILED",
                    loading: false
                }));
            }
        };

        if (imageInfo.id) {
            runAnalysis();
        }
    }, [imageInfo.id]);

    const imageUrl = imageInfo.imageUrl.startsWith('http')
        ? imageInfo.imageUrl
        : `${BASE_URL}${imageInfo.imageUrl}`;

        // 위험 등급(dangerLevel)에 따른 색상 설정
    const getDangerColor = (level) => {
        switch(level) {
            case 'HIGH': return '#ff6b6b';
            case 'MEDIUM': return '#fcc419';
            case 'LOW': return '#51cf66';
            default: return '#adb5bd';
        }
    };

    return (
        <div className="analysis-box" style={{ flexDirection: 'column', marginBottom: '3rem' }}>
            {/* 이미지 영역 */}
            <div style={{ position: 'relative' }}>
                <img
                    src={imageUrl}
                    alt="식물 사진"
                    className="analysis-img"
                    style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
                    crossOrigin="anonymous"
                />
                {result.status === "SUCCESS" && (
                    <div style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: getDangerColor(result.dangerLevel),
                        color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                    }}>
                        위험도: {result.dangerLevel}
                    </div>
                )}
            </div>

                <div className="analysis-result" style={{ width: '100%', marginTop: '1.5rem' }}>
                    <p style={{ color: '#868e96', marginBottom: '1.2rem', fontStyle: 'italic' }}>"{imageInfo.caption}"</p>

                    {result.loading ? (
                        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner"></div> {/* CSS로 애니메이션 추가 필요 */}
                            <p style={{ color: '#12b886', fontWeight: 'bold', marginTop: '1rem' }}>
                                Alleaf AI가 잎사귀를 정밀 분석 중입니다...
                            </p>
                        </div>
                    ) : result.status === "SUCCESS" ? (
                        <div className="result-card" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '15px', border: '1px solid #e9ecef' }}>

                            {/* 1. 식물 정보 */}
                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span className="analysis-badge badge-green">식물 종류</span>
                                    <strong style={{ fontSize: '1.2rem', marginLeft: '0.8rem' }}>{result.plantNameKr}</strong>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#495057', lineHeight: '1.5' }}>{result.plantDescription}</p>
                            </div>

                            {/* 2. 진단 결과 및 가이드 */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                                    <span className="analysis-badge badge-red">진단명</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.8rem', color: '#e03131' }}>
                                    {result.diseaseNameKr}
                                </span>
                                </div>

                                <div className="guide-box" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="guide-item">
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem', color: '#212529' }}>🔍 주요 증상</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#495057' }}>{result.symptoms}</p>
                                    </div>
                                    <div className="guide-item">
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem', color: '#212529' }}>💊 해결 방법</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#495057' }}>{result.solutions}</p>
                                    </div>
                                    <div className="guide-item">
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem', color: '#212529' }}>🛡️ 예방 방법</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#495057' }}>{result.prevention}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ color: '#adb5bd', fontSize: '0.8rem', marginTop: '1.2rem', textAlign: 'right' }}>
                                AI 분석 신뢰도: {(result.diseaseConfidence * 100).toFixed(1)}%
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#fa5252', background: '#fff5f5', borderRadius: '10px' }}>
                            ⚠️ 분석에 실패했습니다. 사진을 다시 확인해주세요.
                        </div>
                    )}
                </div>
            </div>
        );
}

export default function PostDetail() {
    // App.jsx에서 :postId로 설정했으므로 이름을 맞춥니다.
    const {postId} = useParams();
    const navigate = useNavigate();

    const {user: currentUser} = useAuth();

    const [post, setPost] = useState(null);
    const [contentBlocks, setContentBlocks] = useState([]);
    const [isOldText, setIsOldText] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!postId) return;
        fetchPost();
    }, [postId]);

    // [핵심 로직] 게시글 데이터 가져오기 및 파싱
    const fetchPost = async () => {
        try {
            const res = await api.get(`/api/posts/${postId}`);
            setPost(res.data);

            // 본문이 JSON(블록형)인지 일반 텍스트(마크다운)인지 판별
            try {
                const parsed = JSON.parse(res.data.content);
                if (parsed && parsed.blocks) {
                    setContentBlocks(parsed.blocks);
                    setIsOldText(false);
                } else {
                    throw new Error();
                }
            } catch (e) {
                // 파싱 실패 시 구형 마크다운 텍스트로 간주
                setIsOldText(true);
            }
        } catch (err) {
            alert("게시글을 불러올 수 없습니다.");
            navigate('/');
        }finally {
            setLoading(false)
        }
    };

    // [기존 기능] 게시글 삭제
    const handleDelete = async () => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/posts/${postId}`);
            alert("삭제되었습니다.");
            navigate('/');
        } catch (err) {
            alert("삭제 권한이 없습니다.");
        }
    };


    // [기존 기능] 댓글 등록
    const submitComment = async () => {
        if (!commentContent.trim()) return;
        try {
            await api.post(`/api/posts/${postId}/comments`, {content: commentContent});
            setCommentContent('');
            fetchPost(); // 댓글 목록 갱신을 위해 재호출
        } catch (err) {
            alert("댓글을 등록할 수 없습니다. 로그인을 확인해 주세요.");
        }
    };

    // [블록형 렌더러] JSON 데이터를 HTML로 변환
    const renderBlock = (block, index) => {
        switch (block.type) {
            case 'header':
                const HeaderTag = `h${block.data.level || 2}`;
                return <HeaderTag key={index}
                                  style={{fontWeight: 'bold', margin: '2.5rem 0 1rem'}}>{block.data.text}</HeaderTag>;
            case 'paragraph':
                return <p key={index} className="post-content" dangerouslySetInnerHTML={{__html: block.data.text}}
                          style={{marginBottom: '1.2rem', lineHeight: '1.8'}}></p>;
            case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag key={index} style={{marginLeft: '1.5rem', marginBottom: '1.2rem'}}>
                        {block.data.items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{__html: item}}></li>)}
                    </ListTag>
                );
            case 'image':
                return (
                    <AnalysisImageBlock
                        key={index}
                        imageInfo={{
                            id: block.data.file.imageId,
                            imageUrl: block.data.file.url,
                            caption: block.data.caption,
                            plant: block.data.plant,
                            disease: block.data.disease
                        }}
                    />
                );
            default:
                return null;
        }
    };


    if (loading || !post) {
        return <div className="loading">게시글을 불러오는 중입니다... 🌱</div>;
    }

    // 현재 작성자가 지금 로그인 한 사람이 맞는지
    const isAuthor = currentUser && Number(post.memberId) === Number(currentUser.memberId);

    return (
        <>
            <Header/>
            <main className="container" style={{maxWidth: '800px', paddingBottom: '10rem'}}>
                {/* 1. 게시글 헤더 영역 (기존 기능 유지) */}
                <div className="post-header">
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-info">
                        <div>
                            <span style={{fontWeight: 'bold', color: '#343a40'}}>{post.writer}</span>
                            <span style={{margin: '0 0.5rem'}}>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        {isAuthor && (
                            <div className="post-actions">
                                <button onClick={() => navigate(`/posts/${postId}/edit`)}>수정</button>
                                <button onClick={handleDelete} style={{color: '#fa5252'}}>삭제</button>
                            </div>
                            )}
                    </div>
                </div>

                {/* 2. 본문 영역 (하이브리드 렌더링) */}
                <div className="content-area">
                    {isOldText ? (
                        <div className="post-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                        </div>
                    ) : (
                        contentBlocks.map((block, index) => renderBlock(block, index))
                    )}
                </div>

                {/* 3. 댓글 영역 (기존 기능 100% 복구) */}
                <div className="comment-section">
                    <h4>{post.comments?.length || 0}개의 댓글</h4>
                    <div className="comment-input-wrapper">
                        <textarea
                            className="comment-textarea"
                            placeholder="댓글을 작성하세요..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <button className="btn-primary" onClick={submitComment}>댓글 등록</button>
                        </div>
                    </div>
                    <div className="comment-list">
                        {post.comments?.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <span style={{fontWeight: 'bold'}}>{comment.writer}</span>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: '#868e96'
                                    }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{color: '#495057'}}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}