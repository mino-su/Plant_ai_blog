import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || "";

    const getThumbnail = () => {
        if (post.images && post.images.length > 0) {
            const url = post.images[0].imageUrl;
            return url.startsWith('http') ? url : `${BASE_URL}${url}`;
        }
        try {
            const parsed = JSON.parse(post.content);
            const imgBlock = parsed.blocks.find(b => b.type === 'image');
            return imgBlock ? imgBlock.data.file.url : null;
        } catch (e) { return null; }
    };

    const getSummary = () => {
        try {
            const parsed = JSON.parse(post.content);
            const textBlock = parsed.blocks.find(b => b.type === 'paragraph');
            return textBlock
                ? textBlock.data.text.replace(/<[^>]*>/g, '').substring(0, 100)
                : "이미지 게시글입니다.";
        } catch (e) {
            return post.content?.substring(0, 100) || "내용이 없습니다.";
        }
    };

    const thumb = getThumbnail();

    return (
        <div className="post-card" onClick={() => navigate(`/posts/${post.id}`)}>
            <div className="card-thumbnail-wrapper">
                {thumb ? (
                    <img src={thumb} alt={post.title} className="card-thumbnail-img" />
                ) : (
                    <div className="card-thumbnail-placeholder">Alleaf</div>
                )}
            </div>
            <div className="card-content">
                <h4 className="card-title">{post.title}</h4>
                <p className="card-desc">{getSummary()}</p>
                <div className="card-footer">
                    <span>{post.createdAt ? post.createdAt.split(' ')[0] : ''}</span>
                    <span className="separator">·</span>
                    <span>{post.writer || '익명'}</span>
                </div>
                <div className="card-likes">♥ {post.totalLikeCount || 0}</div>
            </div>
        </div>
    );
};

export default PostCard;