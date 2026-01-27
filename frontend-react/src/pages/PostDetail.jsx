import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api'; // 공통 API 모듈
import Header from "../components/Header";
import '../App.css';

const BASE_URL = "http://localhost:8080";

/**
 * [AI 분석 이미지 컴포넌트]
 * 기존의 AnalysisImage 기능을 블록 에디터 구조에 맞게 개량했습니다.
 * 알림창(alert)이 아니라 각 이미지 블록 바로 아래에 결과를 보여줍니다.
 */
function AnalysisImageBlock({ imageInfo }) {
    const [result, setResult] = useState({
        plant: imageInfo.plant || "분석 대기 중...",
        disease: imageInfo.disease || "분석 대기 중...",
        confidence: imageInfo.confidence || 0,
        loading: !imageInfo.plant || imageInfo.plant.includes("분석 대기")
    });

    useEffect(() => {
        // 이미 결과가 있거나 로딩 중이 아니면 실행 안 함
        if (!result.loading) return;

        const runAnalysis = async () => {
            try {
                // 이미지 ID를 사용하여 개별 분석 API 호출
                const res = await api.get(`/api/posts/images/${imageInfo.id}/analyze`);
                setResult({
                    plant: res.data.plant,
                    disease: res.data.disease,
                    confidence: res.data.confidence,
                    loading: false
                });
            } catch (err) {
                console.error("AI 분석 실패:", err);
                setResult(prev => ({ ...prev, plant: "분석 실패", loading: false }));
            }
        };
        runAnalysis();
    }, [imageInfo.id]);

    // 이미지 경로 처리 (서버 주소와 결합)
    const imageUrl = imageInfo.imageUrl.startsWith('http')
        ? imageInfo.imageUrl
        : `${BASE_URL}${imageInfo.imageUrl}`;

    return (
        <div className="analysis-box" style={{ flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            <img
                src={imageUrl}
                alt="식물 사진"
                className="analysis-img"
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                crossOrigin="anonymous"
            />
            <div className="analysis-result" style={{ width: '100%', marginTop: '1.2rem' }}>
                <p style={{ color: '#868e96', marginBottom: '1rem' }}>{imageInfo.caption}</p>
                {result.loading ? (
                    <div style={{ color: '#12b886', fontWeight: 'bold' }}>
                        🔍 AI가 식물을 분석하고 있습니다...
                    </div>
                ) : (
                    <div style={{ background: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #e6fcf5' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="analysis-badge badge-green">식물 종류</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>{result.plant}</span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="analysis-badge badge-red">진단 결과</span>
                            <span style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>{result.disease}</span>
                        </div>
                        <div style={{ color: '#adb5bd', fontSize: '0.85rem', marginTop: '0.8rem' }}>
                            AI 확신도: {(result.confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PostDetail() {
    // App.jsx에서 :postId로 설정했으므로 이름을 맞춥니다.
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [contentBlocks, setContentBlocks] = useState([]);
    const [isOldText, setIsOldText] = useState(false);
    const [commentContent, setCommentContent] = useState('');

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
                } else { throw new Error(); }
            } catch (e) {
                // 파싱 실패 시 구형 마크다운 텍스트로 간주
                setIsOldText(true);
            }
        } catch (err) {
            alert("게시글을 불러올 수 없습니다.");
            navigate('/');
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
            await api.post(`/api/posts/${postId}/comments`, { content: commentContent });
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
                return <HeaderTag key={index} style={{ fontWeight: 'bold', margin: '2.5rem 0 1rem' }}>{block.data.text}</HeaderTag>;
            case 'paragraph':
                return <p key={index} className="post-content" dangerouslySetInnerHTML={{ __html: block.data.text }} style={{ marginBottom: '1.2rem', lineHeight: '1.8' }}></p>;
            case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag key={index} style={{ marginLeft: '1.5rem', marginBottom: '1.2rem' }}>
                        {block.data.items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>)}
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
            default: return null;
        }
    };

    if (!post) return <Header />;

    return (
        <>
            <Header />
            <main className="container" style={{ maxWidth: '800px', paddingBottom: '10rem' }}>
                {/* 1. 게시글 헤더 영역 (기존 기능 유지) */}
                <div className="post-header">
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-info">
                        <div>
                            <span style={{ fontWeight: 'bold', color: '#343a40' }}>{post.writer}</span>
                            <span style={{ margin: '0 0.5rem' }}>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="post-actions">
                            <button onClick={() => navigate(`/posts/${postId}/edit`)}>수정</button>
                            <button onClick={handleDelete} style={{ color: '#fa5252' }}>삭제</button>
                        </div>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={submitComment}>댓글 등록</button>
                        </div>
                    </div>
                    <div className="comment-list">
                        {post.comments?.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>{comment.writer}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#868e96' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ color: '#495057' }}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}