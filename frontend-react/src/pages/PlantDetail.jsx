import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import api from '../api';

// PlantDetailResponseDto.ItemDto 의 Java 필드명 → 한국어 라벨 매핑
const DETAIL_FIELDS = [
    { key: 'clCodeNm',               label: '식물 분류' },
    { key: 'distbNm',                label: '유통 분류' },
    { key: 'dlthtsCodeNm',           label: '병해충' },
    { key: 'orgplceInfo',            label: '원산지' },
    { key: 'postngplaceCodeNm',      label: '배치 장소' },
    { key: 'lighttdemanddoCodeNm',   label: '광도 요구량' },
    { key: 'managedemanddoCodeNm',   label: '관리 난이도' },
    { key: 'adviseInfo',             label: '식물 정보' },
    { key: 'watercycleSprngCodeNm',  label: '봄 물주기' },
    { key: 'watercycleWinterCodeNm', label: '겨울 물주기' },
    { key: 'soilInfo',               label: '토양' },
    { key: 'prpgtEraInfo',           label: '번식 시기' },
    { key: 'lefStleInfo',            label: '잎 형태' },
];

function PlantDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const plant = location.state?.plant;

    const [selectedIdx, setSelectedIdx] = useState(0);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // state에 plant가 있으면 cntntsNo 사용, 없으면 URL params에서 가져옴
    const cntntsNo = plant?.cntntsNo || params.cntntsNo;

    useEffect(() => {
        if (!cntntsNo) return;
        setDetailLoading(true);
        api.get(`/api/publicData/${cntntsNo}`)
            .then(res => setDetail(res.data?.bodyDto?.itemDto || null))
            .catch(() => setDetail(null))
            .finally(() => setDetailLoading(false));
    }, [cntntsNo]);

    if (!plant && !cntntsNo) {
        return (
            <>
                <Header />
                <main className="container">
                    <p>식물 정보를 찾을 수 없습니다.</p>
                    <button className="sort-btn" onClick={() => navigate('/plants')}>목록으로</button>
                </main>
            </>
        );
    }

    const imageUrls = plant?.rtnFileUrl
        ? plant.rtnFileUrl.split('|').filter(Boolean)
        : [];
    const thumbUrls = plant?.rtnThumbFileUrl
        ? plant.rtnThumbFileUrl.split('|').filter(Boolean)
        : [];

    return (
        <>
            <Header />
            <main className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <button className="sort-btn" onClick={() => navigate('/plants')} style={{ marginBottom: '1rem' }}>
                    ← 목록으로
                </button>

                <h2>{plant?.cntntsSj}</h2>

                {/* ── 기존: 메인 이미지 (변경 없음) ── */}
                {imageUrls.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <img
                            src={imageUrls[selectedIdx]}
                            alt={plant?.cntntsSj}
                            style={{
                                width: '100%',
                                maxHeight: '450px',
                                objectFit: 'contain',
                                borderRadius: '12px',
                                background: '#f0f0f0'
                            }}
                        />
                    </div>
                )}

                {/* ── 기존: 썸네일 선택 (변경 없음) ── */}
                {thumbUrls.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {thumbUrls.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`${plant?.cntntsSj} ${i + 1}`}
                                onClick={() => setSelectedIdx(i)}
                                style={{
                                    width: '80px',
                                    height: '64px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    border: selectedIdx === i ? '3px solid #4caf50' : '2px solid transparent',
                                    opacity: selectedIdx === i ? 1 : 0.7
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── 신규: 상세 정보 섹션 ── */}
                {detailLoading && (
                    <p style={{ marginTop: '2rem', color: '#888' }}>상세 정보를 불러오는 중...</p>
                )}

                {!detailLoading && detail && (
                    <section style={{ marginTop: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#12b886', marginBottom: '1rem' }}>
                            🌱 식물 상세 정보
                        </h3>

                        {/* 2열 그리드 정보 카드 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                        }}>
                            {DETAIL_FIELDS.filter(f => detail[f.key]).map(({ key, label }) => (
                                <div key={key} style={{
                                    background: 'var(--bg-card, #f9f9f9)',
                                    border: '1px solid var(--border-color, #e9ecef)',
                                    borderRadius: '10px',
                                    padding: '12px 16px',
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                                        {detail[key]}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 재배 조언 — 전체 너비 */}
                        {detail.fncltyInfo && (
                            <div style={{
                                marginTop: '12px',
                                background: '#f0faf6',
                                border: '1px solid #a8e6cf',
                                borderRadius: '10px',
                                padding: '16px',
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>
                                    기능성 정보
                                </div>
                                <div style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                                    {detail.fncltyInfo}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </>
    );
}

export default PlantDetail;
