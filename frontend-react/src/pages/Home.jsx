import React, { useEffect, useState } from 'react';
import api from '../api';
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import '../App.css';

function Home() {
    const [posts, setPosts] = useState([]); // 게시글 목록
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]); // 페이지 번호가 바뀔 때마다 다시 호출

    const fetchPosts = async (page) => {
        try {
            // 쿼리 파라미터로 page 전달
            const res = await api.get(`/api/posts?page=${page}&size=6`);

            // Page 객체 내부의 데이터 추출
            setPosts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("게시글 로드 실패:", err);
        }
    };

    // 페이지 번호 버튼 클릭 핸들러
    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0); // 페이지 이동 시 최상단으로 스크롤
    };

    return (
        <>
            <Header />

            <main className="container">
                {/* 1. 게시글 그리드 영역 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem',
                    marginTop: '2rem',
                    minHeight: '600px' // 로딩 시 레이아웃 무너짐 방지
                }}>
                    {posts.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#868e96', marginTop: '5rem' }}>
                            작성된 게시글이 없습니다.
                        </p>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))
                    )}
                </div>

                {/* 2. 페이지네이션 UI */}
                {totalPages > 0 && (
                    <div className="pagination-wrapper">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => handlePageClick(currentPage - 1)}
                            className="page-nav-btn"
                        >
                            이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageClick(index)}
                                className={`page-number-btn ${currentPage === index ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => handlePageClick(currentPage + 1)}
                            className="page-nav-btn"
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}

export default Home;