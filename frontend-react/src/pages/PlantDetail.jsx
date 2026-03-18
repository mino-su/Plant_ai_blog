
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';

function PlantDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const plant = location.state?.plant;

    const [selectedIdx, setSelectedIdx] = useState(0);

    if (!plant) {
        // 직접 URL 접근 시 목록으로 돌아가기
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

    // 이미지 URL 배열 파싱
    const imageUrls = plant.rtnFileUrl
        ? plant.rtnFileUrl.split('|').filter(Boolean)
        : [];
    const thumbUrls = plant.rtnThumbFileUrl
        ? plant.rtnThumbFileUrl.split('|').filter(Boolean)
        : [];

    return (
        <>
            <Header />
            <main className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <button className="sort-btn" onClick={() => navigate('/plants')} style={{ marginBottom: '1rem' }}>
                    ← 목록으로
                </button>

                <h2>{plant.cntntsSj}</h2>

                {/* 메인 이미지 */}
                {imageUrls.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <img
                            src={imageUrls[selectedIdx]}
                            alt={plant.cntntsSj}
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

                {/* 썸네일 선택 */}
                {thumbUrls.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {thumbUrls.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`${plant.cntntsSj} ${i + 1}`}
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
            </main>
        </>
    );
}

export default PlantDetail;