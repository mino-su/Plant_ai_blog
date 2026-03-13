import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import '../App.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category');
    const sortType = searchParams.get('sort') || 'latest';


    // category 변경 시 페이지 0으로 리셋
    useEffect(() => {
        setCurrentPage(0);
    }, [category]);

    // 핵심 fetch
    useEffect(() => {
        fetchPosts(currentPage, sortType, category);
    }, [currentPage, sortType, category]);


    const fetchPosts = async (page, sort, category) => {
        try {
            let url;
            if (category && sort === 'popular') {
                url = `/api/posts/category/${category}?sort=popular&page=${page}&size=6`;
            } else if (category) {
                url = `/api/posts/category/${category}?page=${page}&size=6`;
            } else if (sort === 'popular') {
                url = `/api/posts/popular?page=${page}&size=6`;
            } else {
                url = `/api/posts?page=${page}&size=6`;
            }
            const res = await api.get(url);
            setPosts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("게시글 로드 실패:", err);
        }
    };

    const handleSortChange = (type) => {
        setCurrentPage(0);
        const newParams = new URLSearchParams(searchParams);
        if (type === 'latest') {
            newParams.delete('sort');
        } else {
            newParams.set('sort', type);
        }
        setSearchParams(newParams);
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    return (
        <>
            <Header />
            <main className="container home-main">
                <div className="sort-bar">
                    <button
                        className={`sort-btn ${sortType === 'latest' ? 'active' : ''}`}
                        onClick={() => handleSortChange('latest')}
                    >최신순</button>
                    <button
                        className={`sort-btn ${sortType === 'popular' ? 'active' : ''}`}
                        onClick={() => handleSortChange('popular')}
                    >좋아요 순</button>
                </div>

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