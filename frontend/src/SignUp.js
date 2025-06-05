import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    createPassword: '',
    confirmPassword: '',
    email: '',
    tel: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (formData.createPassword !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    const telPattern = /^[0-9]{10}$/;
    if (!telPattern.test(formData.tel)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    setError('');
    try {
      const res = await axios.post('http://localhost:5050/api/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.createPassword,
        tel: formData.tel
      });
    
      // สมัครสำเร็จ
      const userData = {
        username: formData.username,
        password: formData.createPassword,
        email: formData.email,
        tel: formData.tel
      };
    
      localStorage.setItem('userData', JSON.stringify(userData));
      alert(`สมัครสมาชิกสำเร็จ !\nEmail : ${formData.email}\nPassword : ${formData.createPassword}`);
      navigate('/login');
    }
    catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message); // อีเมลนี้ถูกใช้งานแล้ว
      } else {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
      console.log("Signup error:", err);
    }
  }    
  
  return (
    <div className="sign-up-container">
      <div className="sign-up-box">
        <h2 className="title">Sign Up</h2>
        <p className="subtitle">Sign up to continue</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label" htmlFor="username">Username</label>
            <input
              className="input"
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Username"
            />
          </div>

          <div className="input-group">
            <label className="label" htmlFor="createPassword">Create Password</label>
            <input
              className="input"
              type="password"
              id="createPassword"
              name="createPassword"
              value={formData.createPassword}
              onChange={handleChange}
              required
              placeholder="Create Password"
            />
          </div>

          <div className="input-group">
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm Password"
            />
          </div>

          <div className="input-group">
            <label className="label" htmlFor="email">Email</label>
            <input
              className="input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>

          <div className="input-group">
            <label className="label" htmlFor="tel">Tel</label>
            <input
              className="input"
              type="tel"
              id="tel"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="10 Digit Phone Number"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
