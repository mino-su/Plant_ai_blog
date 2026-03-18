import { useState } from 'react';
import { useAuth } from './AuthContext';
import '../App.css';

const SAMPLE_EMAIL = 'test@test.com';
const SAMPLE_PASSWORD = '12345678';

export default function SampleLoginPopup() {
    const { user } = useAuth();
    const [open, setOpen] = useState(true);
    const [copiedField, setCopiedField] = useState(null);

    // 로그인 상태거나 닫혔으면 렌더링하지 않음
    if (!open || user) return null;

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        });
    };

    return (
        <div className="sample-login-popup">
            <div className="sample-popup-header">
                <span className="sample-popup-title">🌿 체험 계정</span>
                <button className="sample-popup-close" onClick={() => setOpen(false)}>×</button>
            </div>
            <p className="sample-popup-desc">아래 계정으로 바로 로그인해보세요!</p>
            <div className="sample-popup-row">
                <span className="sample-popup-label">이메일</span>
                <code className="sample-popup-value">{SAMPLE_EMAIL}</code>
                <button
                    className={`sample-popup-copy-btn ${copiedField === 'email' ? 'copied' : ''}`}
                    onClick={() => handleCopy(SAMPLE_EMAIL, 'email')}
                >
                    {copiedField === 'email' ? '✓' : '복사'}
                </button>
            </div>
            <div className="sample-popup-row">
                <span className="sample-popup-label">비밀번호</span>
                <code className="sample-popup-value">{SAMPLE_PASSWORD}</code>
                <button
                    className={`sample-popup-copy-btn ${copiedField === 'pw' ? 'copied' : ''}`}
                    onClick={() => handleCopy(SAMPLE_PASSWORD, 'pw')}
                >
                    {copiedField === 'pw' ? '✓' : '복사'}
                </button>
            </div>
        </div>
    );
}