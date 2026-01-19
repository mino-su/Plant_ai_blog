import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api'; // 공통 API 모듈 사용
import Header from "../components/Header";
import '../App.css';

/**
 * [AI 분석 이미지 컴포넌트]
 * 스타일을 App.css 기반으로 변경하여 일관성 유지
 */
function AnalysisImage({ imageInfo }) {
    // 이미지는 보통 정적 리소스이므로 서버 주소가 필요할 수 있음 (환경변수 권장)
    const BASE_URL = "http://localhost:8080";

    const [result, setResult] = useState({
        plant: imageInfo.plant || "분석 대기 중...",
        disease: imageInfo.disease || "분석 대기 중...",
        confidence: imageInfo.confidence || 0,
        loading: !(imageInfo.plant && imageInfo.plant !== "분석 대기 중")
    });

    useEffect(() => {
        // 이미 분석된 데이터가 있으면 API 호출 스킵
        if (imageInfo.plant && imageInfo.plant !== "분석 대기 중" && imageInfo.plant !== "") {
            return;
        }

        const runAnalysis = async () => {
            try {
                const res = await api.get(`/api/posts/images/${imageInfo.id}/analyze`);
                setResult({
                    plant: res.data.plant,
                    disease: res.data.disease,
                    confidence: res.data.confidence,
                    loading: false
                });
            } catch (err) {
                console.error("AI 분석 요청 실패:", err);
                setResult(prev => ({ ...prev, plant: "분석 실패", loading: false }));
            }
        };

        runAnalysis();
    }, [imageInfo.id, imageInfo.plant]);

    return (
        <div className="analysis-box">
            <img
                src={`${BASE_URL}${imageInfo.imageUrl}`}
                alt="식물 사진"
                className="analysis-img"
                crossOrigin="anonymous"
            />
            <div className="analysis-result">
                {result.loading ? (
                    <div style={{ color: '#12b886', fontWeight: 'bold' }}>
                        🔍 AI가 식물을 꼼꼼히 살펴보고 있어요...
                    </div>
                ) : (
                    <>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="analysis-badge badge-green">식물 종류</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                {result.plant}
                            </span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="analysis-badge badge-red">진단 결과</span>
                            <span style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>
                                {result.disease}
                            </span>
                        </div>
                        <div style={{ color: '#868e96', fontSize: '0.9rem', marginTop: '1rem' }}>
                            AI 확신도: {(result.confidence * 100).toFixed(1)}%
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * [메인 상세 페이지]
 */
export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/api/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    alert("접근 권한이 없습니다.");
                } else {
                    alert("존재하지 않거나 삭제된 게시글입니다.");
                }
                navigate('/');
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/posts/${id}`);
                alert("삭제되었습니다.");
                navigate('/');
            } catch (err) {
                alert("삭제 권한이 없습니다.");
            }
        }
    };

    const submitComment = async () => {
        if (!commentContent.trim()) return;
        try {
            await api.post(`/api/posts/${id}/comments`, { content: commentContent });
            setCommentContent('');
            // 댓글 작성 후 게시글 데이터 갱신 (댓글 목록 업데이트)
            const res = await api.get(`/api/posts/${id}`);
            setPost(res.data);
        } catch (err) {
            alert("로그인이 필요하거나 권한이 없습니다.");
        }
    };

    if (!post) return (
        <>
            <Header />
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: '#868e96' }}>
                데이터를 불러오는 중입니다...
            </div>
        </>
    );

    return (
        <>
            <Header />
            <main className="container">
                {/* 1. 게시글 헤더 영역 */}
                <div className="post-header">
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-info">
                        <div>
                            <span style={{ fontWeight: 'bold', color: '#343a40' }}>{post.writer}</span>
                            <span style={{ margin: '0 0.5rem' }}>·</span>
                            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        {/* 작성자 본인일 경우에만 보이게 처리하면 더 좋음 */}
                        <div className="post-actions">
                            <button onClick={() => navigate(`/posts/${id}/edit`)}>수정</button>
                            <button onClick={handleDelete} style={{ color: '#fa5252' }}>삭제</button>
                        </div>
                    </div>
                </div>

                {/* 2. AI 이미지 분석 영역 */}
                {post.images && post.images.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        {post.images.map((img) => (
                            <AnalysisImage key={img.id} imageInfo={img} />
                        ))}
                    </div>
                )}

                {/* 3. 마크다운 본문 영역 */}
                <div className="post-content">
                    {/* 일반 텍스트가 아닌 마크다운으로 렌더링 */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* 4. 댓글 영역 */}
                <div className="comment-section">
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        {post.comments ? post.comments.length : 0}개의 댓글
                    </h4>

                    <div className="comment-input-wrapper">
                        <textarea
                            className="comment-textarea"
                            placeholder="댓글을 작성하세요"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={submitComment}>
                                댓글 등록
                            </button>
                        </div>
                    </div>

                    <div className="comment-list">
                        {post.comments && post.comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#343a40' }}>{comment.writer}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#868e96' }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ color: '#495057', lineHeight: '1.5' }}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}