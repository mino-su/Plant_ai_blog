import axios from 'axios';

/**
 * [API 인스턴스 설정]
 */
const api = axios.create({
    baseURL: 'http://localhost:8080',
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
            /**
             * [따옴표 제거 로직]
             * Header.jsx에서 로그인 처리를 할 때 따옴표가 포함되어 저장될 수 있습니다.
             * 여기서 정제해 주면 Header.jsx는 복잡한 처리 없이 데이터를 그냥 저장만 해도 됩니다.
             */
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
    (error) => {
        // 401 Unauthorized: 토큰 만료 시
        if (error.response && error.response.status === 401) {

            /**
             * [Header.jsx와 데이터 동기화]
             * 사용자님의 Header.jsx에서 사용하는 모든 키값을 여기서 한꺼번에 지워줍니다.
             * 그래야 401 에러가 났을 때 헤더의 '로그인 상태'도 즉시 풀리게 됩니다.
             */
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken'); // Header에서 지우는 키 추가
            localStorage.removeItem('userId');       // Header에서 저장하는 키 추가

            alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");

            // 로그인 페이지로 이동 (Header의 navigate('/') 보다 401 상황에선 /login이 더 정석적입니다.)
            window.location.href = '/login';
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