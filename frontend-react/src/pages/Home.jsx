import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx"; // [추가] 컴포넌트 불러오기

function Home() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/api/posts');
            setPosts(res.data);
        } catch (err) {
            console.error("게시글 로드 실패:", err);
        }
    };

    return (
        <>
            <Header />

            <main className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem',
                    marginTop: '2rem',
                    paddingBottom: '2rem' // 하단 여백 추가
                }}>
                    {posts.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#868e96' }}>
                            작성된 게시글이 없습니다.
                        </p>
                    ) : (
                        // [수정] 반복되는 긴 코드를 PostCard 컴포넌트 하나로 대체
                        posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))
                    )}
                </div>
            </main>
        </>
    );
}

export default Home;