import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home'; // 게시글 목록
import PostCreate from './pages/PostCreate'; // 글쓰기
import PostDetail from './pages/PostDetail'; // 상세보기
import PostEdit from './pages/PostEdit'; // 수정하기
import './App.css';

function App() {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 메인: 게시글 목록 */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          
          {/* 글쓰기 */}
          <Route path="/write" element={<PrivateRoute><PostCreate /></PrivateRoute>} />
          
          {/* 상세 조회 */}
          <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
          
          {/* 수정하기 */}
          <Route path="/posts/:id/edit" element={<PrivateRoute><PostEdit /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
