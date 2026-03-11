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
    const [initialEditorData, setInitialEditorData] = useState(null);

    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const res = await api.get(`/api/posts/${postId}`);
                setTitle(res.data.title);

                // 본문 파싱 로직
                let parsedData;
                try {
                    parsedData = JSON.parse(res.data.content);
                } catch (e) {
                    parsedData = {
                        blocks: [{ type: 'paragraph', data: { text: res.data.content } }]
                    };
                }

                setInitialEditorData(parsedData); // 데이터를 먼저 상태에 저장
                setIsLoading(false); // 로딩 끝! (이제 화면에 <div id="editorjs">가 그려짐)
            } catch (err) {
                alert("게시글 정보를 불러올 수 없습니다.");
                navigate(-1);
            }
        };

        if (postId) fetchPostData();
    }, [postId]);

    // 2. [useEffect] 로딩이 끝나고 데이터가 준비되면 에디터를 초기화합니다.
    useEffect(() => {
        // 로딩 중이거나, 데이터가 없거나, 이미 에디터가 있으면 실행 안 함
        if (isLoading || !initialEditorData || editorInstance.current) return;

        const editor = new EditorJS({
            holder: 'editorjs',
            data: initialEditorData, // 불러온 데이터 주입
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

        editorInstance.current = editor;

        // Cleanup: 페이지 나갈 때 해제
        return () => {
            if (editorInstance.current && editorInstance.current.destroy) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, [isLoading, initialEditorData]);

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