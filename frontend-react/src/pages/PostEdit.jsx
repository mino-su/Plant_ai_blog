import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8080";

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 리스트
  const [deleteImageIds, setDeleteImageIds] = useState([]); // 삭제할 ID들
  const [newFiles, setNewFiles] = useState([]); // 새로 추가할 파일들

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setTitle(res.data.title);
      setContent(res.data.content);
      setExistingImages(res.data.images || []); // 기존 이미지 세팅
    } catch (err) {
      alert("데이터 로드 실패");
      navigate(-1);
    }
  };

  // 기존 이미지 삭제 버튼 클릭 시
  const handleDeleteExistingImage = (imgId) => {
    setDeleteImageIds([...deleteImageIds, imgId]); // 삭제 목록에 추가
    setExistingImages(existingImages.filter(img => img.id !== imgId)); // 화면에서 제거
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    // 1. JSON (삭제할 ID 포함)
    const jsonBody = {
      title: title,
      content: content,
      deleteImageIds: deleteImageIds // [1, 3] 형태
    };
    formData.append("post", new Blob([JSON.stringify(jsonBody)], { type: "application/json" }));

    // 2. 새 파일 추가
    newFiles.forEach(file => {
      formData.append("image", file);
    });

    try {
      // [수정된 부분] 
      // 세 번째 인자로 헤더 설정을 넘겨서 api.js의 기본 설정을 덮어씁니다.
      await api.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert("게시글 작성 완료!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("작성 실패: " + (err.response?.data || err.message));
    }
  };

  return (
    <div>
      <h2>✏️ 게시글 수정</h2>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea rows="5" value={content} onChange={(e) => setContent(e.target.value)} required />

        {/* 기존 이미지 목록 */}
        <div style={{display: 'flex', gap: '10px', margin: '10px 0'}}>
          {existingImages.map(img => (
            <div key={img.id} style={{position: 'relative'}}>
              <img src={`${BASE_URL}${img.imgUrl}`} width="100" height="100" style={{objectFit: 'cover'}} />
              <button 
                type="button"
                onClick={() => handleDeleteExistingImage(img.id)}
                style={{position: 'absolute', top: 0, right: 0, background: 'red', width: '20px', height: '20px', padding: 0}}
              >X</button>
            </div>
          ))}
        </div>

        {/* 새 파일 추가 */}
        <input type="file" multiple onChange={(e) => setNewFiles(Array.from(e.target.files))} />

        <button type="submit" style={{marginTop: '20px'}}>수정 완료</button>
      </form>
    </div>
  );
}

export default PostEdit;
