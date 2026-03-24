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
    const { postId } = useParams();
    const navigate = useNavigate();
    const editorInstance = useRef(null);

    const [title, setTitle] = useState('');
    const [newImageIds, setNewImageIds] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [initialEditorData, setInitialEditorData] = useState(null);
    const [category, setCategory] = useState('');

    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";

    // 1. 게시글 데이터 fetch
    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const res = await api.get(`/api/posts/${postId}`);
                setTitle(res.data.title);
                setCategory(res.data.category);
                let parsedData;
                try {
                    parsedData = JSON.parse(res.data.content);
                } catch (e) {
                    parsedData = { blocks: [{ type: 'paragraph', data: { text: res.data.content } }] };
                }
                setInitialEditorData(parsedData);
                setIsLoading(false);
            } catch (err) {
                alert("게시글 정보를 불러올 수 없습니다.");
                navigate(-1);
            }
        };
        if (postId) fetchPostData();
    }, [postId]);

    // 2. 데이터 준비 후 EditorJS 초기화 (StrictMode 이중 실행 대응)
    useEffect(() => {
        if (isLoading || !initialEditorData) return;

        let isCleanedUp = false;
        let currentEditor = null;

        const initEditor = async () => {
            // setTimeout(0): StrictMode의 동기 cleanup이 먼저 실행되도록 한 틱 미룸
            await new Promise(resolve => setTimeout(resolve, 0));
            if (isCleanedUp) return;

            const editor = new EditorJS({
                holder: 'editorjs',
                data: initialEditorData,
                autofocus: true,
                tools: {
                    header: HeaderTool,
                    list: List,
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file) => {
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

            try {
                await editor.isReady;
                if (!isCleanedUp) {
                    currentEditor = editor;
                    editorInstance.current = editor;
                } else {
                    editor.destroy();
                }
            } catch (e) {
                console.error('EditorJS 초기화 실패:', e);
            }
        };

        initEditor();

        return () => {
            isCleanedUp = true;
            if (currentEditor) {
                currentEditor.destroy();
                currentEditor = null;
                editorInstance.current = null;
            }
        };
    }, [isLoading, initialEditorData]);

    const handleUpdate = async () => {
        try {
            await editorInstance.current.isReady;
            const outputData = await editorInstance.current.save();
            const payload = {
                title,
                content: JSON.stringify(outputData),
                newImageIds,
                deleteImageIds,
                category,
            };
            await api.put(`/api/posts/${postId}`, payload);
            alert("수정이 완료되었습니다! ✨");
            navigate(`/posts/${postId}`);
        } catch (err) {
            alert("수정에 실패했습니다.");
        }
    };

    if (isLoading) return (
        <>
            <CustomHeader />
            <div className="container">데이터를 불러오는 중... 🌱</div>
        </>
    );

    return (
        <>
            <CustomHeader />
            <div className="container" style={{ marginTop: '3rem', maxWidth: '800px' }}>
                <input
                    type="text"
                    className="post-title"
                    style={{
                        border: 'none', outline: 'none', width: '100%',
                        background: 'transparent', fontSize: '2.5rem',
                        fontWeight: 'bold', marginBottom: '1rem'
                    }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0' }}>
                    {[
                        { value: 'COMMUNITY', label: '커뮤니티' },
                        { value: 'QUESTION', label: 'Q&A' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setCategory(value)}
                            className={`sort-btn ${category === value ? 'active' : ''}`}
                        >{label}</button>
                    ))}
                </div>
                <div style={{ width: '100%', height: '4px', background: '#12b886', marginBottom: '2rem' }}></div>

                <div className="editor-wrapper" style={{ position: 'relative', width: '100%', minHeight: '500px', overflow: 'visible' }}>
                    <div id="editorjs"></div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', paddingBottom: '5rem' }}>
                    <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', color: '#868e96', cursor: 'pointer' }}>취소</button>
                    <button className="btn-primary" onClick={handleUpdate}>수정 완료</button>
                </div>
            </div>
        </>
    );
}

export default PostEdit;