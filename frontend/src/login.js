import React, { useState, useContext } from 'react';  // เพิ่ม useContext
import './login.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';  // เพิ่มการ import UserContext

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { user, login } = useContext(UserContext);  // ใช้ useContext เพื่อดึงข้อมูล user จาก context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5050/api/login', {
        email,
        password
      });

     
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      
      login(res.data.user);

      navigate('/Home');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'ไม่พบผู้ใช้';

      if (errorMsg === "ไม่พบผู้ใช้") {
        alert('ไม่พบบัญชีผู้ใช้งาน กรุณาสมัครสมาชิกก่อน');
        setErrorMessage('ไม่มีบัญชีนี้อยู่ในระบบ กรุณาสมัครสมาชิกก่อน');
        navigate('/SignUp');
      } else {
        alert('เข้าสู่ระบบไม่สำเร็จ: ' + errorMsg);
        setErrorMessage(errorMsg);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Login to access your account</p>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn">Log In</button>
        </form>

        {/* แสดง error message สีแดง */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <br />
        <p className="footer">
          Don't have an account? <Link to="/SignUp" className="sign-up-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
