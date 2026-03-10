import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import HeaderTool from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import api, { uploadImage } from '../api';
import CustomHeader from "../components/Header";
import '../App.css';

function PostEdit() {
    // [중요] App.jsx의 :postId와 이름을 반드시 맞춰야 합니다.
    const { postId } = useParams();
    const navigate = useNavigate();
    const editorInstance = useRef(null);

    const [title, setTitle] = useState('');
    const [newImageIds, setNewImageIds] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";

    useEffect(() => {
        if (postId) {
            fetchPostAndInitEditor();
        }

        // 페이지를 벗어날 때 에디터 인스턴스를 메모리에서 해제합니다.
        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, [postId]);

    const fetchPostAndInitEditor = async () => {
        try {
            // 주소에 postId를 넣어 정상적인 데이터를 가져옵니다.
            const res = await api.get(`/api/posts/${postId}`);
            setTitle(res.data.title);

            let initialData;
            try {
                // 본문이 JSON 형식이면 파싱하여 블록 단위로 에디터에 주입합니다.
                initialData = JSON.parse(res.data.content);
            } catch (e) {
                // 일반 텍스트라면 에디터가 인식할 수 있는 문단(paragraph) 블록으로 감싸줍니다.
                initialData = {
                    blocks: [{ type: 'paragraph', data: { text: res.data.content } }]
                };
            }

            // Editor.js 인스턴스를 생성합니다.
            const editor = new EditorJS({
                holder: 'editorjs',
                data: initialData,
                tools: {
                    header: HeaderTool,
                    list: List,
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file) => {
                                    // 수정 중 새 이미지를 올릴 때의 처리입니다.
                                    const data = await uploadImage(file);
                                    setNewImageIds(prev => [...prev, data.id]);
                                    return {
                                        success: 1,
                                        file: {
                                            url: `${BASE_URL}${data.imageUrl}`,
                                            imageId: data.id
                                        }
                                    };
                                }
                            }
                        }
                    }
                }
            });
            editorInstance.current = editor;
            setIsLoading(false);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
            alert("게시글 정보를 불러올 수 없습니다.");
            navigate(-1);
        }
    };

    const handleUpdate = async () => {
        try {
            // 에디터에 작성된 최종 내용을 가져와 JSON 문자열로 변환합니다.
            const outputData = await editorInstance.current.save();
            const payload = {
                title: title,
                content: JSON.stringify(outputData),
                newImageIds: newImageIds,
                deleteImageIds: deleteImageIds
            };

            await api.put(`/api/posts/${postId}`, payload);
            alert("수정이 완료되었습니다! ✨");
            navigate(`/posts/${postId}`);
        } catch (err) {
            alert("수정에 실패했습니다.");
        }
    };

    if (isLoading) return <CustomHeader />;

    return (
        <>
            <CustomHeader />
            <div className="container" style={{ marginTop: '3rem', maxWidth: '800px' }}>
                <input
                    type="text"
                    className="post-title"
                    style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        background: 'transparent',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div style={{ width: '100%', height: '4px', background: '#12b886', marginBottom: '2rem' }}></div>

                {/* 에디터가 그려질 공간입니다. */}
                <div id="editorjs" className="post-content"></div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', paddingBottom: '5rem' }}>
                    <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', color: '#868e96', cursor: 'pointer' }}>취소</button>
                    <button className="btn-primary" onClick={handleUpdate}>수정 완료</button>
                </div>
            </div>
        </>
    );
}

export default PostEdit;