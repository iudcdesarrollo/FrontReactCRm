import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../services/authService';
import backgroundImage from '../../assets/login/fachadaUniversitariaDeColombia.webp';
import '../../css/Admins/googleClaud/Login.css';

interface LoginProps {
    setEmail: (email: string) => void;
    error: string | null;
    setError: (error: string | null) => void;
    fetchData: () => void;
}

const Login = ({ setEmail, error, setError, fetchData }: LoginProps) => {
    const containerStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    };

    const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            const decoded = jwtDecode(credentialResponse.credential) as { email: string };
            authService.saveSession(decoded.email);
            setEmail(decoded.email);
            fetchData();
        }
    };

    const handleLoginError = () => {
        setError('Error en la autenticación. Por favor, intente nuevamente.');
    };

    return (
        <div className="login-container" style={containerStyle}>
            <div className="login-overlay"></div>
            <div className="login-content">
                <div className="login-card">
                    <div className="university-logo"></div>
                    <h2>Login.</h2>
                    <p className="login-subtitle">CRM de innovacion.</p>
                    {error && <div className="error-message">{error}</div>}
                    <div className="login-button-container">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={handleLoginError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;