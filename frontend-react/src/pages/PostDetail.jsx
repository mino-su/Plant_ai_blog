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

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (!postId) return;
        fetchPost();
        fetchPostLikeStatus();
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

    // 닉네임 클릭 핸들러
    const handleNicknameClick = (memberId) => {
        if (!memberId) return;
        navigate(`/members/${memberId}/mypage`);
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

    // 좋아요 초기 상태 조회 (@GetMapping("/{postId}/like"))
    const fetchPostLikeStatus = async () => {
        try {
            const res = await api.get(`/api/posts/${postId}/like`);
            // PostLikeDto 구조: { postId, totalLikeCount, isLiked }
            setIsLiked(res.data.liked); // boolean 값
            setLikeCount(res.data.totalLikeCount); // long 값
        } catch (err) {
            console.error("좋아요 상태 조회 실패:", err);
        }
    };

    //좋아요 버튼 토글 핸들러 (@PostMapping / @DeleteMapping)
    const handleLikeToggle = async () => {
        if (!currentUser) {
            if (window.confirm("좋아요는 로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
                navigate('/login');
            }
            return;
        }

        // 본인 글에는 좋아요 금지 (방어 로직)
        if (Number(post?.memberId) === Number(currentUser.memberId)) {
            alert("자신의 게시글에는 좋아요를 누를 수 없습니다. 🌱");
            return;
        }

        try {
            if (isLiked) {
                // 이미 눌려있다면 취소
                const res = await api.delete(`/api/posts/${postId}/like`);
                setIsLiked(res.data.liked); // 서버 응답(false)으로 동기화
                setLikeCount(res.data.totalLikeCount);
            } else {
                // 안 눌려있다면 추가
                const res = await api.post(`/api/posts/${postId}/like`);
                setIsLiked(res.data.liked); // 서버 응답(true)으로 동기화
                setLikeCount(res.data.totalLikeCount);
            }
        } catch (err) {
            // 백엔드 BusinessException (ErrorCode.POST_LIKE_FORBIDDEN 등) 처리
            const errorMessage = err.response?.data?.message || "요청 처리에 실패했습니다.";
            alert(errorMessage);
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
                {/*  게시글 헤더 영역 */}
                <div className="post-header" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h1 className="post-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{post.title}</h1>

                    <div className="post-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* --- 1. 작성자 프로필 & 정보 영역 --- */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img
                                src={
                                    !post.profileImageUrl
                                        ? '/default_profile.jpg'
                                        : post.profileImageUrl.startsWith('http')
                                            ? post.profileImageUrl
                                            : `${BASE_URL}${post.profileImageUrl}`
                                }
                                alt="작성자 프로필"
                                style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    objectFit: 'cover', cursor: 'pointer', border: '1px solid #dee2e6'
                                }}
                                onClick={() => handleNicknameClick(post.memberId)}
                                crossOrigin="anonymous"
                                onError={(e) => { e.target.onerror = null; e.target.src = "/default_profile.jpg"; }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="nickname-link"
                      onClick={() => handleNicknameClick(post.memberId)}
                      style={{ fontWeight: 'bold', color: '#343a40', fontSize: '1.1rem', cursor: 'pointer' }}>
                    {post.writer}
                </span>
                                <span style={{ color: '#868e96', fontSize: '0.9rem', marginTop: '2px' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                </span>
                            </div>
                        </div>

                        {/* --- 2. 수정/삭제 버튼 영역 --- */}
                        {isAuthor && (
                            <div className="post-actions" style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="action-btn"
                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #dee2e6', backgroundColor: 'white', cursor: 'pointer' }}
                                    onClick={() => navigate(`/posts/${postId}/edit`)}
                                >
                                    수정
                                </button>
                                <button
                                    className="action-btn"
                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ff8787', backgroundColor: 'white', color: '#fa5252', cursor: 'pointer' }}
                                    onClick={handleDelete}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/*  본문 영역 (하이브리드 렌더링) */}
                <div className="content-area">
                    {isOldText ? (
                        <div className="post-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                        </div>
                    ) : (
                        contentBlocks.map((block, index) => renderBlock(block, index))
                    )}
                </div>

                {/* ---  좋아요 버튼 영역 --- */}
                <div style={{ textAlign: 'center', margin: '4rem 0 2rem 0' }}>
                    <button
                        onClick={handleLikeToggle}
                        style={{
                            background: isLiked ? '#fff5f5' : '#ffffff',
                            border: `2px solid ${isLiked ? '#ff6b6b' : '#dee2e6'}`,
                            borderRadius: '50%',
                            width: '80px', height: '80px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: isLiked ? '0 4px 10px rgba(255, 107, 107, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{ fontSize: '2rem', lineHeight: '1' }}>{isLiked ? '❤️' : '🤍'}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isLiked ? '#ff6b6b' : '#868e96', marginTop: '5px' }}>
                            {likeCount}
                        </span>
                    </button>
                </div>
                {/* ---------------------------------------------------- */}

                {/* 메인 댓글 작성 영역 */}
                <div className="comment-write-area" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        댓글 {post.comments?.length || 0}개
                    </h3>

                    {/* 로그인 여부에 따라 작성창을 다르게 보여줍니다 */}
                    {currentUser ? (
                        <div className="comment-input-box" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' }}>
                            <textarea
                                className="comment-textarea-styled"
                                placeholder="식물에 대한 따뜻한 댓글을 남겨주세요 🌱"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)} // 상태에 텍스트 저장
                                style={{
                                    width: '100%', minHeight: '80px', padding: '12px',
                                    borderRadius: '8px', border: '1px solid #dee2e6',
                                    resize: 'vertical', fontSize: '1rem'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleCommentSubmit()} // 부모 ID 없이 호출하여 원댓글로 등록
                                    style={{
                                        padding: '8px 20px', borderRadius: '6px',
                                        backgroundColor: '#12b886', color: 'white',
                                        border: 'none', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    댓글 등록
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px',
                            textAlign: 'center', color: '#868e96'
                        }}>
                            댓글을 작성하려면 <span
                            style={{ color: '#12b886', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                            onClick={() => navigate('/login')}
                        >로그인</span>이 필요합니다.
                        </div>
                    )}
                </div>



                {/*  댓글 영역 */}
                {/* 댓글 영역 */}
                <div className="comment-list">
                    {post.comments?.map(comment => {
                        const isCommentAuthor = currentUser && Number(comment.memberId) === Number(currentUser.memberId);

                        const getSafeImageUrl = (url) => {
                            if (!url) return '/default_profile.jpg';
                            return url.startsWith('http') ? url : `${BASE_URL}${url}`;
                        };

                        return (
                            <div key={comment.id} className="comment-thread" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f3f5', paddingBottom: '1.5rem' }}>
                                {/* [1] 부모 댓글 */}
                                <div className="comment-item">
                                    {/* --- 1. 부모 댓글 프로필 & 버튼 헤더 --- */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={getSafeImageUrl(comment.profileImageUrl)}
                                                alt="프로필"
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    objectFit: 'cover', cursor: 'pointer', border: '1px solid #dee2e6'
                                                }}
                                                onClick={() => handleNicknameClick(comment.memberId)}
                                                crossOrigin="anonymous"
                                                onError={(e) => { e.target.onerror = null; e.target.src = "/default_profile.jpg"; }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span
                                                    className="comment-author"
                                                    onClick={() => handleNicknameClick(comment.memberId)}
                                                    style={{ fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                                                >
                                                    {comment.writer}
                                                </span>
                                                <span className="comment-date" style={{ fontSize: '0.8rem', color: '#adb5bd' }}>
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 수정/삭제 버튼 */}
                                        {isCommentAuthor && !comment.deleted && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="action-btn" onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); }}>수정</button>
                                                <button className="action-btn btn-delete" onClick={() => handleCommentDelete(comment.id)}>삭제</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- 2. 부모 댓글 본문 (프로필 너비만큼 들여쓰기) --- */}
                                    {/* 변경점: paddingLeft를 52px(40px+12px)로 고정하여 텍스트가 프로필 이미지 하단으로 침범하지 않게 함 */}
                                    <div style={{ paddingLeft: '52px' }}>
                                        {editingCommentId === comment.id ? (
                                            <div className="comment-edit-area" style={{ marginTop: '0.8rem' }}>
                                                <textarea className="comment-textarea-styled" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                                <div className="button-group-right">
                                                    <button className="action-btn" onClick={() => setEditingCommentId(null)}>취소</button>
                                                    <button className="action-btn" style={{ color: '#12b886', fontWeight: 'bold' }} onClick={() => handleCommentUpdate(comment.id)}>수정완료</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: comment.deleted ? '#adb5bd' : '#495057', margin: '0.5rem 0', lineHeight: '1.6' }}>
                                                {comment.deleted ? "🗑️ 삭제된 댓글입니다." : comment.content}
                                            </p>
                                        )}

                                        {/* 답글 버튼 */}
                                        {!comment.deleted && (
                                            <button className="action-btn btn-reply" onClick={() => handleReplyClick(comment.id)}>
                                                {activeReplyId === comment.id ? "✕ 취소" : "💬 답글 달기"}
                                            </button>
                                        )}

                                        {/* 대댓글 입력창 */}
                                        {activeReplyId === comment.id && (
                                            <div className="reply-input-area" style={{ marginTop: '0.8rem' }}>
                                                <textarea className="comment-textarea-styled" placeholder={`@${comment.writer}님에게 답글 남기기...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                                                <div className="button-group-right">
                                                    <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => handleCommentSubmit(comment.id)}>등록</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* [2] 대댓글 리스트 */}
                                {comment.children && comment.children.length > 0 && (
                                    <div className="comment-replies" style={{ paddingLeft: '0px', marginTop: '1rem' }}>
                                        {comment.children.map(child => {
                                            const isReplyAuthor = currentUser && Number(child.memberId) === Number(currentUser.memberId);
                                            return (
                                                <div key={child.id} className="comment-item" style={{ padding: '1rem', borderTop: '1px dashed #e9ecef', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '8px' }}>

                                                    {/* --- 1. 대댓글 프로필 & 헤더 --- */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <img
                                                                src={getSafeImageUrl(child.profileImageUrl)}
                                                                alt="프로필"
                                                                style={{
                                                                    width: '32px', height: '32px', borderRadius: '50%', // 대댓글 이미지 사이즈 32px
                                                                    objectFit: 'cover', cursor: 'pointer', border: '1px solid #dee2e6'
                                                                }}
                                                                onClick={() => handleNicknameClick(child.memberId)}
                                                                crossOrigin="anonymous"
                                                                onError={(e) => { e.target.onerror = null; e.target.src = "/default_profile.jpg"; }}
                                                            />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span className="comment-author" onClick={() => handleNicknameClick(child.memberId)} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                                    {child.writer}
                                                                </span>
                                                                <span className="comment-date" style={{ fontSize: '0.75rem', color: '#adb5bd' }}>
                                                                    {new Date(child.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isReplyAuthor && !child.deleted && (
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button className="action-btn" style={{ fontSize: '0.75rem' }} onClick={() => { setEditingCommentId(child.id); setEditContent(child.content); }}>수정</button>
                                                                <button className="action-btn btn-delete" style={{ fontSize: '0.75rem' }} onClick={() => handleCommentDelete(child.id)}>삭제</button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* --- 2. 대댓글 본문 (프로필 너비만큼 들여쓰기) --- */}
                                                    {/* 변경점: 대댓글 프로필 넓이(32px) + 갭(10px) = 42px 들여쓰기 */}
                                                    <div style={{ paddingLeft: '42px' }}>
                                                        {editingCommentId === child.id ? (
                                                            <div className="comment-edit-area" style={{ marginTop: '0.8rem' }}>
                                                                <textarea className="comment-textarea-styled" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                                                <div className="button-group-right">
                                                                    <button className="action-btn" onClick={() => setEditingCommentId(null)}>취소</button>
                                                                    <button className="action-btn" style={{ color: '#12b886' }} onClick={() => handleCommentUpdate(child.id)}>수정완료</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p style={{ color: child.deleted ? '#adb5bd' : '#495057', fontSize: '0.9rem', margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>
                                                                {child.deleted ? "🗑️ 삭제된 답글입니다." : child.content}
                                                            </p>
                                                        )}
                                                    </div>
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