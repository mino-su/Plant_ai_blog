import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function PostCreate() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // 마크다운 내용은 여기에 저장됩니다.
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        // 파일 선택 시 state 업데이트
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => { // form 태그가 아니므로 e.preventDefault() 불필요
        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();

        // 1. JSON 데이터 (Spring @RequestPart("post")에 대응)
        const jsonBody = {
            title: title,
            content: content
        };

        // JSON을 Blob으로 감싸서 추가 (한글 깨짐 방지 및 타입 명시)
        formData.append(
            "post",
            new Blob([JSON.stringify(jsonBody)], { type: "application/json" })
        );

        // 2. 이미지 파일들 (Spring @RequestPart("image")에 대응)
        files.forEach((file) => {
            formData.append("image", file);
        });

        try {
            // Content-Type 헤더를 직접 설정하지 마세요!
            // axios가 formData를 감지하면 자동으로 boundary를 포함한 올바른 헤더를 생성합니다.
            await api.post('/api/posts', formData);

            alert("게시글 작성 완료!");
            navigate('/'); // 메인으로 이동
        } catch (err) {
            console.error(err);
            alert("작성 실패: " + (err.response?.data || err.message));
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* 왼쪽: 에디터 영역 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                {/* 제목 입력 연결 */}
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    style={{ fontSize: '2.5rem', border: 'none', outline: 'none', fontWeight: 'bold', marginBottom: '1rem' }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <div style={{ width: '100%', height: '4px', background: 'rgb(73, 80, 87)', marginBottom: '1rem' }}></div>

                {/* 태그나 파일 업로드 UI 추가 (Velog 스타일 하단 바 처럼) */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ cursor: 'pointer', padding: '5px 10px', background: '#eee', borderRadius: '4px' }}>
                        📷 이미지 첨부하기 (여러장 가능)
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }} // 못생긴 기본 input은 숨김
                        />
                    </label>
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#888'}}>
                        {files.length > 0 ? `${files.length}개의 파일 선택됨` : "선택된 파일 없음"}
                    </span>
                </div>

                {/* 본문 입력 연결 */}
                <textarea
                    style={{ flex: 1, border: 'none', resize: 'none', outline: 'none', fontSize: '1.125rem', fontFamily: 'monospace' }}
                    placeholder="당신의 식물 이야기를 적어보세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {/* 하단 버튼 영역 */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>나가기</button>
                    {/* onClick 이벤트 연결 필수 */}
                    <button className="btn-primary" onClick={handleSubmit}>출간하기</button>
                </div>
            </div>

            {/* 오른쪽: 미리보기 영역 */}
            <div style={{ flex: 1, background: '#fbfdfc', padding: '2rem', overflowY: 'auto', borderLeft: '1px solid #eee' }}>
                <h2 style={{color: '#868e96', marginBottom: '2rem'}}>미리보기</h2>
                <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default PostCreate;
