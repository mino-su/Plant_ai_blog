import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {AuthProvider} from "./components/AuthContext.jsx";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import PostCreate from './pages/PostCreate';
import PostDetail from './pages/PostDetail';
import PostEdit from './pages/PostEdit';
import MyPage from "./pages/MyPage";
import Setting from "./pages/settings";
import Search from './pages/Search';
import './App.css';

/**
 * [작동 원리 및 수정 포인트]
 * 1. PrivateRoute: 토큰 여부에 따라 페이지 접근을 제한하는 아주 정석적인 보안 로직입니다.
 * 2. 파라미터 명명: :id 대신 :memberId, :postId를 사용하여 useParams() 호출 시 데이터 성격을 명확히 했습니다.
 * 3. 컨테이너 제거: <div className="container">를 여기서 제거했습니다.
 * - 이유: 에디터 페이지나 홈 화면 등 페이지마다 필요한 너비가 다르기 때문입니다.
 * - 대신 각 페이지 컴포넌트(Home, MyPage 등) 내부에서 최상단에 <div className="container">를 넣어주세요.
 */
function App() {
    // 인증 보호 라우트 (로그인 안 한 유저는 접근 불가)
    const PrivateRoute = ({ children }) => {
        const token = localStorage.getItem('accessToken');
        return token ? children : <Navigate to="/login" />;
    };

    return (
        <AuthProvider>
            <Router>
                {/* 전역 container를 삭제하여 각 페이지가 자신의 레이아웃을 100% 통제하게 합니다.
             에디터 같은 페이지는 화면 끝까지 넓게 써야 하기 때문입니다.
          */}
                <Routes>
                    {/* 인증이 필요 없는 공용 라우트 */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />

                    {/* [에디터 개편] 글쓰기 - Editor.js가 로드될 페이지 */}
                    <Route path="/write" element={<PrivateRoute><PostCreate /></PrivateRoute>} />

                    {/* [구조화] 마이페이지 - 파라미터를 :memberId로 변경하여 가독성 향상 */}
                    <Route path="/members/:memberId/mypage" element={<MyPage />} />

                    {/* [구조화] 상세 조회 - 파라미터를 :postId로 변경 */}
                    <Route path="/posts/:postId" element={<PostDetail />} />

                    {/* [에디터 개편] 수정하기 - 기존 데이터를 JSON으로 불러올 페이지 */}
                    <Route path="/posts/:postId/edit" element={<PrivateRoute><PostEdit /></PrivateRoute>} />

                    {/* 설정 및 프로필 수정 */}
                    <Route path="/setting" element={<PrivateRoute><Setting /></PrivateRoute>} />

                    {/* 검색 페이지 */}
                    <Route path="/search" element={<Search />} />

                    {/* 잘못된 주소 접근 시 메인으로 리다이렉트 (방어 코드) */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;