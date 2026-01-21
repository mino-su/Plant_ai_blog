import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    // 백엔드 서버 주소 (환경에 따라 수정 가능)
    const BASE_URL = "http://localhost:8080";

    // 1. 날짜 포맷팅 (백엔드의 createdAt 필드 사용)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    // 2. 본문 요약 (Velog 스타일로 특수문자 제거 및 3줄 제한)
    const summary = post.content
        ? post.content.replace(/[#*`\n]/g, ' ').substring(0, 120) + (post.content.length > 120 ? '...' : '')
        : "내용이 없는 게시글입니다.";

    // 3. 썸네일 URL 추출 (렌지님의 PostImageDto 구조: images[0].imageUrl)
    const thumbnailUrl = (post.images && post.images.length > 0)
        ? `${BASE_URL}${post.images[0].imageUrl}`
        : null;

    return (
        <div
            className="post-card"
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            {/* 썸네일 영역: 비율 16:9 유지 */}
            <div className="card-thumbnail-wrapper">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={post.title}
                        className="card-thumbnail-img"
                        loading="lazy" /* 성능을 위한 지연 로딩 */
                    />
                ) : (
                    <div className="card-thumbnail-placeholder">
                        <span>Alleaf</span>
                    </div>
                )}
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="card-content">
                <h4 className="card-title">{post.title}</h4>
                <p className="card-desc">{summary}</p>

                {/* 하단 푸터: 날짜 및 댓글 수 */}
                <div className="card-footer">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="separator">·</span>
                    <span>{(post.comments?.length || 0)}개의 댓글</span>
                </div>
            </div>

            {/* 작성자 정보 (Velog 카드 하단 구분선 영역) */}
            <div className="card-user-info">
                <span>by <b>{post.writer || '익명'}</b></span>
            </div>
        </div>
    );
};

export default PostCard;