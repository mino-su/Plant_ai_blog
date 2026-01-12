import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const navigate = useNavigate();
  // 이미지 기본 URL (백엔드 주소)
  const BASE_URL = "http://localhost:8080";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setPost(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("게시글을 불러올 수 없습니다.");
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/posts/${id}`);
        alert("삭제되었습니다.");
        navigate('/');
      } catch (err) {
        alert("작성자만 삭제할 수 있습니다.");
      }
    }
  };

  // 댓글 작성 함수
  const submitComment = async (parentId = null) => {
    if(!commentContent.trim()) return;
    try {
      await api.post(`/api/posts/${id}/comments`, {
        content: commentContent,
        parentId: parentId
      });
      setCommentContent('');
      fetchPost(); // 댓글 작성 후 새로고침
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  if (!post) return <div>로딩중...</div>;

  return (
    <div>
      {/* 1. 게시글 영역 */}
      <h1>{post.title}</h1>
      <p style={{color: 'gray'}}>작성자: {post.writer} | {new Date(post.createdAt).toLocaleString()}</p>
      
      {/* 이미지 렌더링 */}
      {post.images && post.images.map((img) => (
        <img 
          key={img.id} 
          src={`${BASE_URL}${img.imageUrl}`} 
          alt="post-img"
          crossOrigin="anonymous"
          style={{maxWidth: '100%', borderRadius: '8px'}} 
        />
      ))}
      
      <div style={{minHeight: '100px', margin: '20px 0'}}>{post.content}</div>

      <div style={{display: 'flex', gap: '10px'}}>
        <Link to={`/posts/${id}/edit`}><button>수정</button></Link>
        <button onClick={handleDelete} style={{backgroundColor: '#ff4444'}}>삭제</button>
        <Link to="/"><button style={{backgroundColor: 'gray'}}>목록</button></Link>
      </div>

      <hr />

      {/* 2. 댓글 작성 영역 (루트) */}
      <div style={{display: 'flex', gap: '5px'}}>
        <input 
          type="text" 
          value={commentContent} 
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="댓글을 입력하세요..." 
        />
        <button onClick={() => submitComment(null)} style={{width: '80px'}}>등록</button>
      </div>

      {/* 3. 댓글 리스트 (재귀 컴포넌트) */}
      <div style={{marginTop: '20px', textAlign: 'left'}}>
        {post.comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} fetchPost={fetchPost} />
        ))}
      </div>
    </div>
  );
}

// [핵심] 대댓글을 그리기 위한 재귀 컴포넌트
function CommentItem({ comment, fetchPost }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleDeleteComment = async () => {
    if(window.confirm("댓글을 삭제할까요?")) {
      try {
        await api.delete(`/api/comments/${comment.id}`);
        fetchPost();
      } catch(err) { alert("본인 댓글만 삭제 가능합니다."); }
    }
  };

  const handleReplySubmit = async () => {
    try {
      // 대댓글 작성 (부모 ID 포함)
      await api.post(`/api/posts/${comment.postId}/comments`, { // 주의: postId를 comment 객체에 포함시키거나 props로 내려줘야 함. (여기선 간략화)
        // 실제로는 postId는 상위에서 props로 받아야 가장 정확함. 
        // 편의상 url을 /api/comments/reply/{id} 처럼 안 짰다면 postId가 필요함.
        // **수정 제안**: CommentResponseDto에 postId가 없다면 PostDetail에서 postId를 props로 내려줘야 함.
        content: replyContent,
        parentId: comment.id
      });
      setReplyContent('');
      setReplyOpen(false);
      fetchPost();
    } catch(err) { 
        // 여기서 에러나면 postId가 없어서일 확률 높음. 
        // 해결: api 주소를 /api/posts/${useParams().id}/comments 로 보내야 함.
        alert("대댓글 작성 실패"); 
    }
  };
  
  // PostDetail의 ID 가져오기 (Hook 사용)
  const params = useParams(); 
  
  const submitReplyReal = async () => {
      try {
          await api.post(`/api/posts/${params.id}/comments`, {
              content: replyContent,
              parentId: comment.id
          });
          setReplyContent('');
          setReplyOpen(false);
          fetchPost();
      } catch (e) { alert(e.message); }
  }


  return (
    <div style={{borderLeft: '2px solid #ddd', paddingLeft: '10px', marginTop: '10px'}}>
      <div style={{fontSize: '14px'}}>
        <strong>{comment.writer}</strong>: {comment.content}
        <span style={{marginLeft: '10px', fontSize: '12px', cursor: 'pointer', color: 'blue'}} onClick={() => setReplyOpen(!replyOpen)}>
           [답글]
        </span>
        <span style={{marginLeft: '5px', fontSize: '12px', cursor: 'pointer', color: 'red'}} onClick={handleDeleteComment}>
           [삭제]
        </span>
      </div>

      {/* 답글 입력창 */}
      {replyOpen && (
        <div style={{display: 'flex', marginTop: '5px'}}>
           <input size="small" value={replyContent} onChange={(e)=>setReplyContent(e.target.value)} />
           <button onClick={submitReplyReal} style={{fontSize:'12px', padding: '2px 5px'}}>등록</button>
        </div>
      )}

      {/* 자식 댓글 렌더링 (재귀) */}
      {comment.children && comment.children.map(child => (
        <CommentItem key={child.id} comment={child} fetchPost={fetchPost} />
      ))}
    </div>
  );
}

export default PostDetail;
