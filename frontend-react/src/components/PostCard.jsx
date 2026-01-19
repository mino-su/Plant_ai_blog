import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // 스타일 적용

const PostCard = ({ post }) => {

    const BASE_URL = "http://localhost:8080";

    const navigate = useNavigate();

    // 날짜 포맷팅 함수 (YYYY년 MM월 DD일)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    // 본문 요약 (HTML 태그나 마크다운 기호 제거하고 순수 텍스트만 100자)
    // 실제 서비스에선 백엔드에서 'summary' 필드를 따로 주는 게 좋습니다.
    const summary = post.content
        ? post.content.replace(/[#*`]/g, '').substring(0, 100) + (post.content.length > 100 ? '...' : '')
        : "내용이 없습니다.";

    const thumbnailUrl = (post.images && post.images.length > 0)
        ? `${BASE_URL}${post.images[0].imageUrl}`
        : null;

    return (
        <div
            className="post-card"
            onClick={() => navigate(`/posts/${post.id}`)}
        >
            {/* 1. 썸네일 영역 */}
            <div className="card-thumbnail-wrapper">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={post.title}
                        className="card-thumbnail-img"
                    />
                ) : (
                    // 리스트가 비어있을 때 보여줄 기본 배경
                    <div className="card-thumbnail-placeholder">
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Image</span>
                    </div>
                )}
            </div>

            {/* 2. 텍스트 영역 */}
            <div className="card-content">
                <h4 className="card-title">{post.title}</h4>
                <p className="card-desc">{summary}</p>

                <div className="card-footer">
                    <span className="card-date">{formatDate(post.createdDate || post.date)}</span>
                    <span className="card-comments">{(post.comments?.length || 0)}개의 댓글</span>
                </div>

                {/* (선택) 작성자 정보 표시 */}
                <div className="card-user-info">
                    <span>by <b>{post.writer || '익명'}</b></span>
                </div>
            </div>
        </div>
    );
};

export default PostCard;