// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { memberId: 7, username: '...' } 형태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);


    const fetchMyInfo = async () => {
        try {
            const res = await api.get('/api/members/me');
            setUser(res.data);
            setIsLoggedIn(true);
            localStorage.setItem('userId', res.data);
        } catch (err) {
            console.error("인증 실패", err)
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const loginSuccess = (token) =>{
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
        fetchMyInfo();
    }

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId')
        setUser(null);
        setIsLoggedIn(false);
    };

    // 앱이 처음 켜질 때 딱 한 번만 실행됨
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchMyInfo();
        } else{
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, fetchMyInfo, handleLogout, loginSuccess, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);