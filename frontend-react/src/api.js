import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// [요청 인터셉터] 모든 요청 보낼 때 헤더에 토큰 자동 부착
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// [응답 인터셉터] 응답을 받았는데 에러가 났을 때 처리하는 곳 (★핵심)
api.interceptors.response.use(
  (response) => response, // 성공한 응답(200)은 그대로 통과
  (error) => {
    // 백엔드에서 401 Unauthorized (인증 실패/토큰 만료) 에러를 보냈을 때
    if (error.response && error.response.status === 401) {
      
      // 1. (선택) 사용자에게 알림
      alert("로그인 세션이 만료되었습니다. 메인 페이지로 이동합니다.");
      
      // 2. 로그아웃 처리 (저장된 토큰 삭제)
      localStorage.clear(); 
      
      // 3. 메인 페이지로 강제 이동 (새로고침 효과)
      window.location.href = "/";
    }
    
    // 401 외의 다른 에러는 컴포넌트에서 처리하도록 그냥 넘김
    return Promise.reject(error);
  }
);

export default api;
