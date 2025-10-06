import loginTop from '../assets/images/bckg.png';
import loginBackground from '../assets/images/bckg1.png';
import loginBottom from '../assets/images/bckg2.png';
import '../assets/css/loginStyles.css';
import logo from '../assets/images/circuitLogo.png';
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    
    function handleLogin(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setError('');
        setSuccess('');
            setSuccess('Login successful!');
            setTimeout(() => {
                navigate('/home');
            }, 1000);
        // // Simple validation
        // if (!email || !password) {
        //     setError('Please enter both email and password.');
        //     return;
        // }

        // // Simulate login logic (replace with real API call)
        // if (email === 'user@example.com' && password === 'password123') {
        //     setSuccess('Login successful!');
        //     setTimeout(() => {
        //         navigate('/home');
        //     }, 1000);
        // } else {
        //     setError('Invalid email or password.');
        // }
    }
    function handleClick(arg0: string): void {
        console.log(`${ arg0} clicked`)
    }

  return (
    <div className="loginLayout">
            <div className="layoutLeft">
                <img className="loginTopImg" src={loginTop} alt="Background" />
                <div className="logoHeader">
                    <img src={logo} alt="logo" onClick={() => console.log('logo clicked')} />
                    <div className="registerBtnTopContainer">
                        Don’t have an account?&nbsp;
                        <span>
                            <Link to="/register">
                                <button className="registerBtn">Register</button>
                            </Link>
                        </span>
                    </div>
                </div>
                <div className="loginContent">
                    <h1 className="welcomeText">Welcome Back</h1>
                    <p className="loginText">Login into your account</p>                    
                    <form className="loginForm" onSubmit={handleLogin}>
                        <input type="email" className="loginInput" placeholder="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" className="loginInput" placeholder="Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <div className="forgetPasswordContainer">
                            <div className="chkBoxContainerLogin">
                                <input type="checkbox" id="rememberMe" className="loginChk" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                <label htmlFor="rememberMe">Remember Me</label>
                            </div>
                            <div>
                                <a href="#" onClick={() => handleClick('forgot')}>
                                    Forgot Password?
                                </a>
                            </div>
                        </div>
                        {error && (
                            <p className="errorText" style={{ color: 'red' }}>
                                {error}
                            </p>
                        )}
                        {success && <p style={{ color: 'green' }}>{success}</p>}
                        <button type="submit" className="loginButton loginSubmitButton">
                            Submit
                        </button>
                    </form>
                    <div className="registerBtnBottomContainer">
                        Don’t have an account?&nbsp;
                        <span>
                            <Link to="/register">
                                <button className="registerBtn">Register</button>
                            </Link>
                        </span>
                    </div>
                </div>
                <img className="loginBottomImg" src={loginBottom} alt="Background" />
            </div>
            <div className="layoutRight">
                <img className="loginImg" src={loginBackground} alt="Background" />
            </div>
        </div>
  )
}

export default Login