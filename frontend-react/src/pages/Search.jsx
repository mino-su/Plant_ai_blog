import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import '../App.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // URL에서 초기값 가져오기 (새로고침 대비)
    const initialType = searchParams.get('type') || 'all';
    const initialKeyword = searchParams.get('keyword') || '';
    const initialPage = parseInt(searchParams.get('page')) || 0;

    // 상태 관리
    const [type, setType] = useState(initialType);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    // [핵심] URL 파라미터가 바뀔 때마다 API 호출 (뒤로가기, 검색 등 대응)
    useEffect(() => {
        const currentType = searchParams.get('type') || 'all';
        const currentKeyword = searchParams.get('keyword') || '';
        const currentPage = parseInt(searchParams.get('page')) || 0;

        // 검색어가 있을 때만 조회 (혹은 전체 조회를 원하면 조건 제거)
        fetchSearchResults(currentType, currentKeyword, currentPage);

        // 상태도 URL에 맞춰 동기화
        setType(currentType);
        setKeyword(currentKeyword);
    }, [searchParams]);

    const fetchSearchResults = async (searchType, searchKeyword, page) => {
        setLoading(true);
        try {
            // 백엔드 PostSearchConditionDto와 매핑
            const res = await api.get('/api/posts/search', {
                params: {
                    type: searchType,
                    keyword: searchKeyword,
                    page: page,
                    size: 6, // 한 페이지에 보여줄 개수
                    sort: 'createdAt,DESC'
                }
            });

            setPosts(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error("검색 실패:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        if (!keyword.trim()) {
            alert("검색어를 입력해주세요.");
            return;
        }
        // URL을 변경하면 위의 useEffect가 감지해서 데이터를 가져옴
        setSearchParams({ type, keyword, page: 0 });
    };

    // 엔터키 처리
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        setSearchParams({ type, keyword, page: newPage });
        window.scrollTo(0, 0);
    };

    return (
        <>
            <Header />
            <main className="container">
                {/* 1. 검색 바 영역 */}
                <div className="search-bar-container">
                    <select
                        className="search-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                        <option value="writer">작성자</option>
                        <option value="plant">식물명</option>
                        <option value="disease">질병명</option>
                    </select>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="검색어를 입력하세요..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <button className="search-btn" onClick={handleSearch}>
                        검색
                    </button>
                </div>

                {/* 2. 검색 결과 요약 */}
                <div className="search-summary">
                    {initialKeyword && (
                        <p>
                            '<span className="highlight">{initialKeyword}</span>' 검색 결과:
                            총 <strong>{totalElements}</strong>건
                        </p>
                    )}
                </div>

                {/* 3. 게시글 그리드 (로딩 및 결과 없음 처리) */}
                {loading ? (
                    <div className="text-center py-20">검색 중입니다... 🌱</div>
                ) : (
                    <div className="post-grid">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="empty-search">
                                <p>검색 결과가 없습니다.</p>
                                <span style={{ fontSize: '3rem' }}>🍂</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. 페이지네이션 (Home과 동일한 로직) */}
                {totalPages > 0 && (
                    <div className="pagination-wrapper">
                        <button
                            disabled={initialPage === 0}
                            onClick={() => handlePageChange(initialPage - 1)}
                            className="page-nav-btn"
                        >
                            이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={`page-number-btn ${initialPage === index ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            disabled={initialPage === totalPages - 1}
                            onClick={() => handlePageChange(initialPage + 1)}
                            className="page-nav-btn"
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default Search;