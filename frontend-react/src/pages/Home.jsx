import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import '../App.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => { fetchPosts(currentPage); }, [currentPage]);

    const fetchPosts = async (page) => {
        try {
            const res = await api.get(`/api/posts?page=${page}&size=6`);
            setPosts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("게시글 로드 실패:", err);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    return (
        <>
            <Header />
            <main className="container home-main">
                <div className="post-grid">
                    {posts?.length === 0 ? (
                        <p className="empty-state">작성된 게시글이 없습니다.</p>
                    ) : (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    )}
                </div>

                {totalPages > 0 && (
                    <div className="pagination-wrapper">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => handlePageClick(currentPage - 1)}
                            className="page-nav-btn"
                        >이전</button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageClick(index)}
                                className={`page-number-btn ${currentPage === index ? 'active' : ''}`}
                            >{index + 1}</button>
                        ))}
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => handlePageClick(currentPage + 1)}
                            className="page-nav-btn"
                        >다음</button>
                    </div>
                )}
            </main>
        </>
    );
}

export default Home;