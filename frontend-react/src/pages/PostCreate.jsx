import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function PostCreate() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // 이미지 파일들
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // FileList -> Array 변환
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // 1. JSON 데이터 (Blob으로 감싸서 application/json 타입 지정)
    const jsonBody = {
      title: title,
      content: content
    };
    
    // 이 부분은 아주 잘 하셨습니다 (백엔드 @RequestPart가 읽을 수 있게 함)
    formData.append(
      "post", 
      new Blob([JSON.stringify(jsonBody)], { type: "application/json" })
    );

    // 2. 이미지 파일들
    files.forEach((file) => {
      formData.append("image", file);
    });

    try {
      // [수정된 부분] 
      // 세 번째 인자로 헤더 설정을 넘겨서 api.js의 기본 설정을 덮어씁니다.
      await api.post('/api/posts', formData, {
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
      <h2>📝 글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" placeholder="제목" 
          value={title} onChange={(e) => setTitle(e.target.value)} required 
        />
        <textarea 
          placeholder="내용" rows="5" style={{width: '100%', marginBottom: '10px'}}
          value={content} onChange={(e) => setContent(e.target.value)} required 
        />
        {/* 파일 입력 */}
        <input type="file" multiple onChange={handleFileChange} accept="image/*" />
        
        <button type="submit" style={{marginTop: '10px'}}>등록하기</button>
      </form>
    </div>
  );
}

export default PostCreate;
