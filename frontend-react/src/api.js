import axios from 'axios';

/**
 * [API 인스턴스 설정]
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
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

        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            // 1. 리프레시 토큰이 없으면(비로그인) 재발급 시도 안 함
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const accessToken = localStorage.getItem('accessToken');
                const res = await axios.post('/auth/reissue', {
                    accessToken,
                    refreshToken
                });

                if (res.status === 200) {
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }
            } catch (reissueError) {
                // 2. 재발급 실패 시, '내 정보 조회' API가 아닐 때만 로그인으로 보냄
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                if (!originalRequest.url.includes('/api/members/me')) {
                    window.location.href = '/login';
                }
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