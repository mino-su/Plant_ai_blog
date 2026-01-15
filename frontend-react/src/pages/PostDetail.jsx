import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * [API 설정 및 인터셉터 수정]
 * 사용자님이 제공하신 TokenDto 구조(accessToken 필드)에 맞춰
 * 인증 로직을 더 정교하게 수정했습니다.
 */
const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
});

// [작동 원리] 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // 1. 로컬 스토리지에서 저장된 데이터를 가져옵니다.
        // 보통 TokenDto 전체를 JSON 문자열로 저장하거나, accessToken만 따로 저장합니다.
        const savedToken = localStorage.getItem('accessToken');

        if (savedToken) {
            /**
             * [수정 포인트]
             * 만약 localStorage에 TokenDto 객체를 통째로 넣었다면
             * JSON.parse(savedToken).accessToken 으로 꺼내야 하지만,
             * 보통은 로그인 시 accessToken 문자열만 따로 저장하는 것이 더 평범하고 관리하기 쉽습니다.
             */
            const cleanToken = savedToken.replace(/^"(.*)"$/, '$1'); // 따옴표 제거 방어 코드

            // 2. TokenDto의 grantType이 'Bearer'이므로 형식을 맞춥니다.
            config.headers.Authorization = `Bearer ${cleanToken}`;

            console.log(">>> [API 요청] TokenDto 기반 accessToken 부착 완료");
        } else {
            console.warn(">>> [API 요청] accessToken을 찾을 수 없습니다. 로그인이 필요합니다.");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * [이미지 분석 전담 컴포넌트]
 */
function AnalysisImage({ imageInfo }) {
    const BASE_URL = "http://localhost:8080";

    const [result, setResult] = useState({
        plant: imageInfo.plant || "분석 대기 중...",
        disease: imageInfo.disease || "분석 대기 중...",
        confidence: imageInfo.confidence || 0,
        loading: !(imageInfo.plant && imageInfo.plant !== "분석 대기 중")
    });

    useEffect(() => {
        if (imageInfo.plant && imageInfo.plant !== "분석 대기 중" && imageInfo.plant !== "") {
            return;
        }

        const runAnalysis = async () => {
            try {
                const res = await api.get(`/api/posts/images/${imageInfo.id}/analyze`);
                setResult({
                    plant: res.data.plant,
                    disease: res.data.disease,
                    confidence: res.data.confidence,
                    loading: false
                });
            } catch (err) {
                console.error("AI 분석 요청 실패:", err);
                setResult(prev => ({ ...prev, plant: "분석 실패", loading: false }));
            }
        };

        runAnalysis();
    }, [imageInfo.id, imageInfo.plant]);

    return (
        <div className="border rounded-2xl overflow-hidden shadow-sm bg-gray-50 mb-6">
            <img
                src={`${BASE_URL}${imageInfo.imageUrl}`}
                alt="식물 사진"
                crossOrigin="anonymous"
                className="w-full h-auto object-cover"
            />
            <div className="p-4 bg-white border-t text-left">
                {result.loading ? (
                    <div className="flex items-center gap-2 text-blue-600 animate-pulse font-medium">
                        <span>🔍 AI가 식물을 분석하고 있습니다...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm sm:text-base">
                        <div><span className="font-bold text-green-700">🌿 식물:</span> {result.plant}</div>
                        <div><span className="font-bold text-red-600">🦠 진단:</span> {result.disease}</div>
                        <div><span className="font-bold text-gray-500">📊 정확도:</span> {(result.confidence * 100).toFixed(1)}%</div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * [게시글 상세 페이지 메인 컴포넌트]
 */
export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/api/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    alert("인증 정보가 올바르지 않거나 만료되었습니다. 다시 로그인해 주세요.");
                    navigate('/');
                } else {
                    alert("게시글을 불러올 수 없습니다.");
                    navigate('/');
                }
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/posts/${id}`);
                alert("삭제되었습니다.");
                navigate('/');
            } catch (err) {
                alert("삭제 권한이 없습니다.");
            }
        }
    };

    const submitComment = async () => {
        if (!commentContent.trim()) return;
        try {
            await api.post(`/api/posts/${id}/comments`, { content: commentContent });
            setCommentContent('');
            const res = await api.get(`/api/posts/${id}`);
            setPost(res.data);
        } catch (err) {
            alert("댓글 작성 권한이 없습니다.");
        }
    };

    if (!post) return <div className="p-10 text-center text-gray-400">데이터 로딩 중...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10 mb-20 text-left">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{post.title}</h1>
            <p className="text-gray-400 text-sm mb-6 border-b pb-4">
                작성자: {post.writer} | {post.createdAt ? new Date(post.createdAt).toLocaleString() : '날짜 없음'}
            </p>

            <div className="space-y-4">
                {post.images && post.images.length > 0 ? (
                    post.images.map((img) => (
                        <AnalysisImage key={img.id} imageInfo={img} />
                    ))
                ) : (
                    <p className="text-gray-300 italic py-4">등록된 이미지가 없습니다.</p>
                )}
            </div>

            <div className="min-h-[200px] text-lg text-gray-700 leading-relaxed my-8 whitespace-pre-wrap">
                {post.content}
            </div>

            <div className="flex gap-3 mb-10">
                <Link to={`/posts/${id}/edit`}><button className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">수정</button></Link>
                <button onClick={handleDelete} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">삭제</button>
                <Link to="/"><button className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">목록</button></Link>
            </div>

            <hr className="mb-8" />

            <div className="flex gap-2 mb-6">
                <input className="flex-1 p-3 border rounded-xl outline-none" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="의견을 남겨주세요..." />
                <button onClick={submitComment} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition">등록</button>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-600 mb-4">댓글 ({post.comments ? post.comments.length : 0})</h3>
                {post.comments && post.comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm text-green-700">{comment.writer}</span>
                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}