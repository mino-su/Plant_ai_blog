import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./components/AuthContext.jsx";
import { ToastContainer, toast } from 'react-toastify';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import PostCreate from './pages/PostCreate';
import PostDetail from './pages/PostDetail';
import PostEdit from './pages/PostEdit';
import MyPage from "./pages/MyPage";
import Setting from "./pages/settings";
import Search from './pages/Search';
import FollowListPage from "./pages/FollowListPage.jsx";
import PlantEncyclopedia from './pages/PlantEncyclopedia';
import PlantDetail from './pages/PlantDetail';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

/**
 * [백그라운드 알림 매니저]
 * 앱 전역에서 렌더링되며 SSE 연결 및 Toast 팝업을 담당
 */
function NotificationManager() {
    const { user, token } = useAuth();
    const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "";

    useEffect(() => {
        if (!user || !token) return;

        const eventSource = new EventSource(`${BASE_URL}/api/notifications/subscribe?token=${token}`);

        // 알림이 도착했음을 앱 전체에 알리는 헬퍼 함수
        const triggerBadgeUpdate = () => {
            window.dispatchEvent(new Event('newNotification'));
        };

        eventSource.addEventListener('connection', (e) => {
            console.log("🟢 SSE 연결 완료:", e.data);
        });

        eventSource.addEventListener('like', (e) => {
            toast.info(`❤️ ${e.data}`, { position: "top-right", autoClose: 3000 });
            triggerBadgeUpdate();
        });

        eventSource.addEventListener('comment', (e) => {
            toast.success(`💬 ${e.data}`, { position: "top-right", autoClose: 3000 });
            triggerBadgeUpdate();
        });

        eventSource.addEventListener('follow', (e) => {
            toast.info(`👤 ${e.data}`, { position: "top-right", autoClose: 3000 });
            triggerBadgeUpdate();
        });

        eventSource.onerror = (error) => {
            console.error("🔴 SSE 연결 에러. 재연결 대기 중...", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            console.log("⚪ SSE 연결 해제");
        };
    }, [user, token]);

    return null;
}

/**
 * [인증 보호 라우트]
 * 성능 최적화를 위해 App 컴포넌트 바깥으로 분리
 */
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" />;
};


function App() {
    return (
        <AuthProvider>
            <Router>
                {/* Router 안쪽에 배치하여 추후 알림 클릭 시 페이지 이동(navigate)이 가능하도록 설계 */}
                <ToastContainer />
                <NotificationManager />

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/write" element={<PrivateRoute><PostCreate /></PrivateRoute>} />
                    <Route path="/members/:memberId/mypage" element={<MyPage />} />
                    <Route path="/posts/:postId" element={<PostDetail />} />
                    <Route path="/posts/:postId/edit" element={<PrivateRoute><PostEdit /></PrivateRoute>} />
                    <Route path="/setting" element={<PrivateRoute><Setting /></PrivateRoute>} />
                    <Route path="/search" element={<Search />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/members/:memberId/:type" element={<PrivateRoute><FollowListPage /></PrivateRoute>} />
                    <Route path="/plants" element={<PlantEncyclopedia />} />
                    <Route path="/plants/:cntntsNo" element={<PlantDetail />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;