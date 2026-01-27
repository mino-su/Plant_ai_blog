import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import api, { uploadImage } from '../api'; // 수정된 api.js 활용
import CustomHeader from "../components/Header";
import '../App.css';

/**
 * [게시글 생성 페이지 - Editor.js 버전]
 * 작동 원리:
 * 1. 사용자가 사진을 추가하면 즉시 uploadImage API가 호출됩니다.
 * 2. 서버가 준 {id, imageUrl} 중 id는 imageIds 배열에 보관하고, imageUrl은 에디터에 보여줍니다.
 * 3. 최종 저장 시, 에디터의 모든 블록을 JSON 문자열로 변환하여 보냅니다.
 */
function PostCreate() {
    const navigate = useNavigate();
    const editorInstance = useRef(null); // 에디터 객체를 담을 참조 변수
    const [title, setTitle] = useState('');
    const [imageIds, setImageIds] = useState([]); // 업로드된 사진들의 ID를 추적

    useEffect(() => {
        // [중요] 리액트의 StrictMode 때문에 에디터가 두 번 생기는 것을 방지하기 위해 초기화 체크
        if (!editorInstance.current) {
            initEditor();
        }
        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, []);

    const initEditor = () => {
        const editor = new EditorJS({
            holder: 'editorjs', // 이 ID를 가진 div에 에디터가 생깁니다.
            placeholder: '당신의 식물 이야기를 블록 단위로 적어보세요...',
            tools: {
                header: Header,
                list: List,
                image: {
                    class: ImageTool,
                    config: {
                        /**
                         * [커스텀 업로드 핸들러]
                         * 에디터에서 사진을 선택하면 실행되는 로직입니다.
                         */
                        uploader: {
                            uploadByFile: async (file) => {
                                try {
                                    // 1. 서버에 사진 단독 업로드
                                    const data = await uploadImage(file);

                                    // 2. 나중에 게시글과 연결하기 위해 ID 저장
                                    setImageIds(prev => [...prev, data.id]);

                                    // 3. 에디터 화면에 사진을 띄우기 위한 결과 반환
                                    return {
                                        success: 1,
                                        file: {
                                            url: `http://localhost:8080${data.imageUrl}`,
                                            imageId: data.id // 이미지 블록 데이터에 ID 포함
                                        }
                                    };
                                } catch (error) {
                                    return { success: 0 };
                                }
                            }
                        }
                    }
                }
            }
        });
        editorInstance.current = editor;
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        try {
            // 에디터의 모든 데이터를 가져옵니다 (JSON 형태)
            const outputData = await editorInstance.current.save();

            // 백엔드 PostRequestDto 구조에 맞게 조립
            const payload = {
                title: title,
                content: JSON.stringify(outputData), // 블록 데이터를 문자열로 직렬화
                imageIds: imageIds // 이번 글에 쓰인 사진 ID 리스트
            };

            await api.post('/api/posts', payload);
            alert("식물 일기가 출간되었습니다! 🌿");
            navigate('/');
        } catch (err) {
            console.error("저장 실패:", err);
            alert("저장에 실패했습니다.");
        }
    };

    return (
        <>
            <CustomHeader />
            <div className="container" style={{ marginTop: '3rem', maxWidth: '800px' }}>
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    className="post-title"
                    style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div style={{ width: '100%', height: '4px', background: '#12b886', marginBottom: '2rem' }}></div>

                {/* Editor.js가 마운트될 구역 */}
                <div id="editorjs" className="post-content" style={{ minHeight: '500px' }}></div>

                <div className="flex justify-between" style={{ marginTop: '2rem', paddingBottom: '5rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#868e96', cursor: 'pointer' }}>나가기</button>
                    <button className="btn-primary" onClick={handleSave}>출간하기</button>
                </div>
            </div>
        </>
    );
}

export default PostCreate;