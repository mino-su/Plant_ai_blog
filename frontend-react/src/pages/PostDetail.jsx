import React, {useEffect, useRef, useState} from 'react';
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

    //중복 호출 방지를 위한 useRef(StrictMode 대응)
    const analysisStarted = useRef(false);

    useEffect(() => {
        if(analysisStarted.current) return;

        const runAnalysis = async () => {
            try {
                analysisStarted.current = true;
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

    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    const [editingCommentId, setEditingCommentId] = useState(null); // 현재 수정 중인 댓글 ID
    const [editContent, setEditContent] = useState("");


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

    // [댓글 수정 함수]
    const handleCommentUpdate = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await api.put(`/api/comments/${commentId}`, { content: editContent });
            alert("댓글이 수정되었습니다.");
            setEditingCommentId(null);
            fetchPost();
        } catch (err) {
            alert("수정 실패: 권한이 없습니다.");
        }
    };

    // [댓글 삭제 함수]
    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/comments/${commentId}`); // 컨트롤러 경로에 맞게 수정
            alert("댓글이 삭제되었습니다.");
            fetchPost();
        } catch (err) {
            alert("삭제 권한이 없습니다.");
        }
    };

    // 액션 버튼 렌더러 (수정 로직 연결)
    const renderCommentActions = (comment) => {
        const isCommentAuthor = currentUser && Number(comment.memberId) === Number(currentUser.memberId);
        if (!isCommentAuthor || comment.isDeleted) return null;

        return (
            <div className="comment-actions" style={{ fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                    }}
                    style={{ background: 'none', border: 'none', color: '#868e96', cursor: 'pointer' }}
                >수정</button>
                <button
                    onClick={() => handleCommentDelete(comment.id)}
                    style={{ background: 'none', border: 'none', color: '#fa5252', cursor: 'pointer' }}
                >삭제</button>
            </div>
        );
    };




    // [기존 기능] 댑글 달기 버튼 클릭 핸들러
    const handleReplyClick = (commentId) => {
        if (activeReplyId === commentId) {
            setActiveReplyId(null); // 이미 열려있으면 닫기
            setReplyContent("");
        } else {
            setActiveReplyId(commentId); // 해당 댓글에 답글창 열기
            setReplyContent("");
        }
    };

    const handleCommentSubmit = async (parentId = null) => {
        // 1. 입력값 결정: 대댓글(parentId 있음)이면 replyContent를, 원댓글(parentId 없음)이면 commentContent
        const contentToSubmit = parentId ? replyContent : commentContent;


        if (!contentToSubmit.trim()) return;

        try {

            const payload = {
                content: contentToSubmit,
                parentId: parentId // 원댓글일 경우 여기가 null
            };

            // 4. API 요청
            await api.post(`/api/posts/${postId}/comments`, payload);

            // 5. 성공 시 입력창 초기화
            if (parentId) {
                // 대댓글을 달았다면 답글창 내용만 지우고 창을 닫음
                setReplyContent('');
                setActiveReplyId(null);
            } else {
                // 원댓글을 달았다면 메인 댓글창만 지워줘.
                setCommentContent('');
            }

            // 6. 최신 데이터 불러오기: 방금 단 댓글이 화면에 보이도록 게시글을 다시 조회
            fetchPost();
            alert(parentId ? "답글이 등록되었습니다." : "댓글이 등록되었습니다.");

        } catch (err) {
            console.error(err);
            alert("등록에 실패했습니다.");
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

                {/* 3. 댓글 영역 */}
                <div className="comment-list">
                    {post.comments?.map(comment => {
                        const isCommentAuthor = currentUser && Number(comment.memberId) === Number(currentUser.memberId);

                        return (
                            <div key={comment.id} className="comment-thread">
                                {/* [1] 부모 댓글 */}
                                <div className="comment-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="comment-author">{comment.writer}</span>
                                            <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>

                                            {/* 수정/삭제 버튼 */}
                                            {isCommentAuthor && !comment.isDeleted && (
                                                <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                                                    <button className="action-btn" onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); }}>수정</button>
                                                    <button className="action-btn btn-delete" onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 본문/수정창 분기 */}
                                    {editingCommentId === comment.id ? (
                                        <div className="comment-edit-area">
                                            <textarea className="comment-textarea-styled" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                            <div className="button-group-right">
                                                <button className="action-btn" onClick={() => setEditingCommentId(null)}>취소</button>
                                                <button className="action-btn" style={{ color: '#12b886', fontWeight: 'bold' }} onClick={() => handleCommentUpdate(comment.id)}>수정완료</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: comment.isDeleted ? '#adb5bd' : '#495057', margin: '0.8rem 0', lineHeight: '1.6' }}>
                                            {comment.isDeleted ? "🗑️ 삭제된 댓글입니다." : comment.content}
                                        </p>
                                    )}

                                    {/* 답글 버튼 */}
                                    {!comment.isDeleted && (
                                        <button className="action-btn btn-reply" onClick={() => handleReplyClick(comment.id)}>
                                            {activeReplyId === comment.id ? "✕ 취소" : "💬 답글 달기"}
                                        </button>
                                    )}

                                    {/* 대댓글 입력창 */}
                                    {activeReplyId === comment.id && (
                                        <div className="reply-input-area">
                                            <textarea className="comment-textarea-styled" placeholder={`@${comment.writer}님에게 답글 남기기...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                                            <div className="button-group-right">
                                                <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => handleCommentSubmit(comment.id)}>등록</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* [2] 대댓글 리스트 */}
                                {comment.children && comment.children.length > 0 && (
                                    <div className="comment-replies">
                                        {comment.children.map(child => {
                                            const isReplyAuthor = currentUser && Number(child.memberId) === Number(currentUser.memberId);
                                            return (
                                                <div key={child.id} className="comment-item" style={{ padding: '1rem 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span className="comment-author" style={{ fontSize: '0.9rem' }}>↳ {child.writer}</span>
                                                            <span className="comment-date" style={{ fontSize: '0.75rem' }}>{new Date(child.createdAt).toLocaleDateString()}</span>
                                                            {isReplyAuthor && !child.isDeleted && (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button className="action-btn" style={{ fontSize: '0.75rem' }} onClick={() => { setEditingCommentId(child.id); setEditContent(child.content); }}>수정</button>
                                                                    <button className="action-btn btn-delete" style={{ fontSize: '0.75rem' }} onClick={() => handleCommentDelete(child.id)}>삭제</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {editingCommentId === child.id ? (
                                                        <div className="comment-edit-area">
                                                            <textarea className="comment-textarea-styled" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                                            <div className="button-group-right">
                                                                <button className="action-btn" onClick={() => setEditingCommentId(null)}>취소</button>
                                                                <button className="action-btn" style={{ color: '#12b886' }} onClick={() => handleCommentUpdate(child.id)}>수정완료</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p style={{ color: child.isDeleted ? '#adb5bd' : '#495057', fontSize: '0.95rem', margin: '0.4rem 0 0 1.2rem' }}>
                                                            {child.isDeleted ? "🗑️ 삭제된 답글입니다." : child.content}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}