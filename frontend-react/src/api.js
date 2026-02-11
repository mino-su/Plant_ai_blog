import axios from 'axios';

/**
 * [API 인스턴스 설정]
 */
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
});

/**
 * 1. [요청 인터셉터]
 * Header.jsx에서 저장한 'accessToken'을 가로채서 서버로 보냅니다.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            const cleanToken = token.replace(/^"(.*)"$/, '$1');
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 2. [응답 인터셉터]
 * 사용자님의 Header.jsx 내 handleLogout 로직과 '키 이름'을 맞췄습니다.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 Unauthorized: 토큰 만료 시
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지용

            try {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                // backend의 /auth/reissue 호출
                const res = await axios.post('http://localhost:8080/auth/reissue', {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });

                if(res.status == 200){
                    const {accessToken: newAccessToken, refreshToken: newRefreshToken} = res.data;

                    // 새 토큰 저장
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // 원래 실패 했던 요청에 새 토큰을 넣어 재시도
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }

            } catch (reissueError) {
                // 재발급 마저 실패할 경우(refreshToken 만료 등) 로그아웃 처리
                console.error("토큰 재발급 실패. 다시 로그인 해야 합니다.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(reissueError);

            }
        }
        return Promise.reject(error);
    }
);

/**
 * 3. [에디터 전용 이미지 업로드 함수]
 * PostCreate.jsx에서 사용할 예정입니다.
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file); // 서버 @RequestPart("image")와 매칭

    const response = await api.post('/api/posts/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });

    /**
     * 서버가 돌려주는 데이터 구조: { id: 10, imageUrl: "..." }
     */
    return response.data;
};

export default api;