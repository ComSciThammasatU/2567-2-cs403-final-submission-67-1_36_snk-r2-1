import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Review.css';
import axios from 'axios';

const Review = () => {
  const [feedback, setFeedback] = useState(null);
  const [issues, setIssues] = useState([]);
  const [zone, setZone] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]); 
  const navigate = useNavigate();

  const handleIssueChange = (e) => {
    const value = e.target.value;
    const newIssues = e.target.checked
      ? [...issues, value]
      : issues.filter((item) => item !== value);
    setIssues(newIssues);
  };

  const handleZoneChange = (e) => {
    setZone(e.target.value);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);  
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index)); 
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('feedback', feedback);
      formData.append('zone', zone);
      formData.append('comment', comment);
      formData.append('issues', JSON.stringify(issues)); // ส่งเป็น JSON string
      images.forEach((file) => formData.append('images', file)); // รองรับหลายภาพ


      await axios.post('http://localhost:5050/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('ส่งรีวิวสำเร็จ!');
      setFeedback(null);
      setZone('');
      setIssues([]);
      setComment('');
      setImages([]);
      window.location.reload();
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่งรีวิว:', error);
      alert('เกิดข้อผิดพลาดในการส่งรีวิว');
    }
  };
  
  return (
    <div className="review-page">
      <div className="navbar">
        <h2>WELCOME TO THE GYMNASIUM 7 MIRROR RESERVATION</h2>
      </div>

      <div className="main-content">
        <div className="review-navbar">
          <span className="welcome-text">ยินดีต้อนรับสู่ระบบ การจองกระจกยิมเนเซียม 7 . . .</span>
        </div>

        <div className="navbar-review">
          <span>รายงานการเกิดปัญหาในการใช้งาน</span>
        </div>

        <div className="sidebar">
          <h2>
            <Link to="/Home">
              <img src="https://i.postimg.cc/vm55pPsm/image.png" alt="Menu Icon" className="menu-icon" />
            </Link>
            <span className="menu-text">Menu</span>
          </h2>
          <ul>
            <li><Link to="/booking" className="sidebar-link">การจอง</Link></li>
            <li><Link to="/history" className="sidebar-link">ประวัติการจอง</Link></li>
            <li><Link to="/review" className="sidebar-link">รายงานปัญหา</Link></li>
            <li><Link to="/logout" className="sidebar-link">ออกจากระบบ</Link></li>
          </ul>
        </div>

        <div className="main-content">
            <div className="review-container-emotion">
              <h3>ความพอใจในการใช้งาน</h3>
              <div className="feedback-toggle">
                <div onClick={() => setFeedback('bad')} className={`icon ${feedback === 'bad' ? 'selected' : ''}`}>😡</div>
                <div onClick={() => setFeedback('neutral')} className={`icon ${feedback === 'neutral' ? 'selected' : ''}`}>😐</div>
                <div onClick={() => setFeedback('good')} className={`icon ${feedback === 'good' ? 'selected' : ''}`}>😊</div>
              </div>
            </div>

          {feedback && (
            <>
              {feedback !== 'good' ? (
                <div className="review-container-other">
                  <h3>Zone ที่ไม่เป็นระเบียบในการใช้งาน</h3>
                  <div className="zone-list">
                    {['Zone A', 'Zone B', 'Zone C','Zone D'].map((z, i) => (
                      <label key={i}>
                        <input type="radio" name="zone" value={z} onChange={handleZoneChange} />
                        {z}
                      </label>
                    ))}
                  </div>

                  <h3>ความไม่เป็นระเบียบการใช้งาน</h3>
                  <div className="issues-section">
                    <div className="issues-list">
                      {['เสียง', 'ขยะ', 'มีกลุ่มที่ใช้พื้นที่เกินเวลา', 'อื่นๆ'].map((item, index) => (
                        <label key={index}>
                          <input type="checkbox" value={item} onChange={handleIssueChange} />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {(feedback === 'good' || issues.length > 0) && (
                <div className="review-container-comment">
                  <h3>ข้อเสนอแนะเพิ่มเติม</h3>
                  <div className="comment-box">
                    {images.length > 0 && (
                      <div className="image-preview-container">
                        {images.map((file, index) => (
                          <div key={index} className="image-container">
                            <img
                              src={URL.createObjectURL(file)} 
                              alt={`upload preview ${index}`}
                              className="preview"
                            />
                            <button
                              className="remove-image-btn"
                              onClick={() => handleRemoveImage(index)}
                              title="ลบรูปภาพ"
                            >
                              ❌
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      placeholder="พิมพ์ข้อความที่นี่..."
                      maxLength={1000}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="comment-footer">
                      <input
                        type="file"
                        id="image-upload"
                        onChange={handleImageUpload}
                        hidden
                        multiple
                      />
                      <label htmlFor="image-upload" className="upload-btn">+</label>
                      <span>{comment.length}/1000</span>
                    </div>
                  </div>
                </div>
              )}

              <button className="submit-btn" onClick={handleSubmit}>ส่ง</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
