import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  // 1. 페이지 로드 시 게시글 목록 가져오기
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error("게시글 로드 실패:", err);
    }
  };

  // 2. 로그아웃 핸들러 (이전 코드에서 가져옴)
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); // 서버에도 로그아웃 요청
    } catch (err) {
      console.log("서버 로그아웃 실패했으나 클라이언트 처리는 진행");
    } finally {
      localStorage.clear(); // 로컬 스토리지 비우기
      alert("로그아웃 되었습니다.");
      navigate('/login'); // 로그인 화면으로 이동
    }
  };

  return (
    <div>
      {/* 상단 헤더 영역: 제목 + 버튼들 */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        <h1 style={{margin: 0}}>📌 게시판</h1>
        
        <div style={{display: 'flex', gap: '10px'}}>
          <Link to="/write">
            <button style={{width: 'auto', padding: '10px 20px'}}>✏️ 글쓰기</button>
          </Link>
          <button 
            onClick={handleLogout} 
            style={{backgroundColor: '#ff4444', width: 'auto', padding: '10px 20px'}}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 게시글 목록 영역 */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        {posts.length === 0 ? (
          <p style={{color: 'gray'}}>등록된 게시글이 없습니다.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} style={{
              border: '1px solid #ddd', 
              padding: '20px', 
              borderRadius: '8px', 
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              backgroundColor: 'white'
            }}>
              <Link to={`/posts/${post.id}`} style={{textDecoration: 'none', color: 'black'}}>
                <h3 style={{margin: '0 0 10px 0', color: '#333'}}>{post.title}</h3>
              </Link>
              
              <div style={{fontSize: '13px', color: '#666', display: 'flex', justifyContent: 'space-between'}}>
                <span>👤 작성자: {post.writer}</span>
                <span>📅 {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
