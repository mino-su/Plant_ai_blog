
import React, { useEffect, useState } from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import api from '../api';
import Header from '../components/Header.jsx';
import '../App.css';

const LIGHT_OPTIONS = [
    { value: '055001', label: '낮은 광도' },
    { value: '055002', label: '중간 광도' },
    { value: '055003', label: '높은 광도' },
];

const GROWTH_OPTIONS = [
    { value: '054001', label: '직립형' },
    { value: '054002', label: '관목형' },
    { value: '054003', label: '덩굴성' },
    { value: '054004', label: '풀모양' },
    { value: '054005', label: '로제트형' },
    { value: '054006', label: '다육형' },
];

const SEASON_OPTIONS = [
    { value: '073001', label: '봄' },
    { value: '073002', label: '여름' },
    { value: '073003', label: '가을' },
    { value: '073004', label: '겨울' },
];

const KOREAN_CONSONANTS = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function PlantEncyclopedia() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 상태
    const [plants, setPlants] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 검색/필터 상태
    const [sText, setSText] = useState(searchParams.get('sText') || '');
    const [word, setWord] = useState(searchParams.get('word') || '');
    const [lightChecked, setLightChecked] = useState([]);
    const [growthChecked, setGrowthChecked] = useState([]);
    const [seasonChecked, setSeasonChecked] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const numOfRows = 12;

    // 페이지/검색 변경 시 fetch
    useEffect(() => {
        fetchPlants();
    }, [pageNo, searchParams]);

    const fetchPlants = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('pageNo', pageNo);
            params.set('numOfRows', numOfRows);

            const sTextParam = searchParams.get('sText');
            if (sTextParam) {
                params.set('sType', 'sCntntsSj');
                params.set('sText', sTextParam);
            }
            const wordParam = searchParams.get('word');
            if(wordParam){
                params.set('wordType', 'cntntsSj');
                params.set('word', wordParam);
            }
            if (lightChecked.length > 0) params.set('lightChkVal', lightChecked.join(','));
            if (growthChecked.length > 0) params.set('grwhstleChkVal', growthChecked.join(','));
            if (seasonChecked.length > 0) params.set('ignSeasonChkVal', seasonChecked.join(','));

            const res = await api.get(`/api/publicData?${params.toString()}`);

            // ✅ 수정: bodyDto.items 까지 내려가야 itemDtoList와 totalCount에 접근 가능
            const items = res.data.bodyDto.items;
            setPlants(items.itemDtoList || []);
            setTotalCount(items.totalCount || 0);
        } catch (err) {
            setError('식물 데이터를 불러오지 못했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 검색 제출
    const handleSearch = (e) => {
        e.preventDefault();
        setPageNo(1);
        setWord('');

        const newParams = new URLSearchParams(searchParams);
        newParams.delete('word');

        if (sText.trim()) {
            newParams.set('sText', sText.trim());
        } else {
            newParams.delete('sText');
        }
        setSearchParams(newParams);
    };

    // 초성 검색
    const handleConsonant = (consonant) => {
        setWord(consonant);
        setSText('');
        setPageNo(1);

        const newParams = new URLSearchParams(searchParams);
        newParams.delete('sText');
        newParams.set('word', consonant);
        setSearchParams(newParams);
    };

    // 체크박스 토글 헬퍼
    const toggleCheck = (setter, value) => {
        setter(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        setPageNo(1);
    };

    // 썸네일 URL 파싱 (첫 번째 URL 사용)
    const getFirstThumb = (rtnThumbFileUrl) => {
        if (!rtnThumbFileUrl) return null;
        return rtnThumbFileUrl.split('|')[0];
    };

    const totalPages = Math.ceil(totalCount / numOfRows);

    return (
        <>
            <Header />
            <main className="container">

                <div >
                    <h2 style={{ marginTop: '2rem' }}>🌿 식물 도감</h2>
                </div>


                {/* 검색창 */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', margin: '1rem 0' }}>
                    <input
                        type="text"
                        value={sText}
                        onChange={e => setSText(e.target.value)}
                        placeholder="식물 이름으로 검색"
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" className="sort-btn active">검색</button>
                </form>

                {/* 초성 검색 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                    {KOREAN_CONSONANTS.map(c => (
                        <button
                            key={c}
                            onClick={() => handleConsonant(c)}
                            className={`sort-btn ${searchParams.get('word') === c ? 'active' : ''}`}
                            style={{ minWidth: '32px' }}
                        >{c}</button>
                    ))}
                    <button
                        className="sort-btn"
                        onClick={() => {
                            setSText('');
                            setWord('');
                            setLightChecked([]);
                            setGrowthChecked([]);
                            setSeasonChecked([]);
                            setPageNo(1);
                            setSearchParams({});
                        }}
                    >전체</button>
                </div>

                {/* 필터 */}
                <details style={{ marginBottom: '1rem', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>상세 필터</summary>
                    <div style={{ marginTop: '12px' }}>
                        <div>
                            <strong>광도 요구</strong>
                            {LIGHT_OPTIONS.map(o => (
                                <label key={o.value} style={{ marginLeft: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={lightChecked.includes(o.value)}
                                        onChange={() => toggleCheck(setLightChecked, o.value)}
                                    /> {o.label}
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <strong>생육 형태</strong>
                            {GROWTH_OPTIONS.map(o => (
                                <label key={o.value} style={{ marginLeft: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={growthChecked.includes(o.value)}
                                        onChange={() => toggleCheck(setGrowthChecked, o.value)}
                                    /> {o.label}
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <strong>꽃피는 계절</strong>
                            {SEASON_OPTIONS.map(o => (
                                <label key={o.value} style={{ marginLeft: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={seasonChecked.includes(o.value)}
                                        onChange={() => toggleCheck(setSeasonChecked, o.value)}
                                    /> {o.label}
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={fetchPlants}
                            className="sort-btn active"
                            style={{ marginTop: '12px' }}
                        >필터 적용</button>
                    </div>
                </details>

                {/* 결과 */}
                {loading && <p>불러오는 중...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!loading && plants.length === 0 && <p className="empty-state">검색 결과가 없습니다.</p>}

                <div className="post-grid">
                    {plants.map(plant => (
                        <div
                            key={plant.cntntsNo}
                            className="post-card"
                            onClick={() => navigate(`/plants/${plant.cntntsNo}`, { state: { plant } })}
                            style={{ cursor: 'pointer' }}
                        >
                            {getFirstThumb(plant.rtnThumbFileUrl) ? (
                                <img
                                    src={getFirstThumb(plant.rtnThumbFileUrl)}
                                    alt={plant.cntntsSj}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '180px', background: '#e8f5e9', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    🌱
                                </div>
                            )}
                            <div style={{ padding: '12px' }}>
                                <strong>{plant.cntntsSj}</strong>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <button
                            className="page-nav-btn"
                            disabled={pageNo === 1}
                            onClick={() => setPageNo(p => p - 1)}
                        >이전</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`page-number-btn ${pageNo === i + 1 ? 'active' : ''}`}
                                onClick={() => setPageNo(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button
                            className="page-nav-btn"
                            disabled={pageNo === totalPages}
                            onClick={() => setPageNo(p => p + 1)}
                        >다음</button>
                    </div>
                )}
            </main>
        </>
    );
}

export default PlantEncyclopedia;