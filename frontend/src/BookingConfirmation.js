import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const { eventName, bookerName, selectedCourt, bookingDate, startTime, endTime } = location.state;
  const formatTime = (timeObj) => {
    // ถ้าเป็น string แล้วก็คืนค่าเลย
    if (typeof timeObj === 'string') return timeObj;
    // ถ้าเป็น dayjs object หรือ Date object ให้ format
    return new Date(timeObj).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div className="app-container">
      {/* Navbar บนสุด */}
      <div className="booking-navbar">
        <span className="welcome-text">ยินดีต้อนรับสู่ระบบ การจองกระจกยิมเนเซียม 7 . . .</span>
      </div>

      {/* Navbar ล่าง */}
      <div className="navbar-2">
        <span>จองกระจกยิมเนเซียม 7</span>
      </div>

      {/* Sidebar เมนู */}
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

      {/* เนื้อหายืนยันการจอง */}
      <div className="main-content-booking">
        <div className="confirmation-container">
          <h2 className="confirmation-title">การจองสำเร็จ</h2>
          <div className="confirmation-details">
            <div className="confirmation-item">
              <span className="confirmation-label">ชื่อกิจกรรม:</span>
              <span className="confirmation-value">{eventName}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">ชื่อผู้จอง:</span>
              <span className="confirmation-value">{bookerName}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">Zone:</span>
              <span className="confirmation-value">{selectedCourt}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">เวลาที่จอง:</span>
              <span className="confirmation-value">
                {`${startTime} - ${endTime}`}
              </span>
            </div>


            <div className="confirmation-item">
              <span className="confirmation-label">วันที่จอง:</span>
              <span className="confirmation-value">{new Date(bookingDate).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">เวลาที่ยืนยันการจอง:</span>
              <span className="confirmation-value">{new Date().toLocaleString('th-TH')}</span>
            </div>
          </div>

          <div className="back-button-container">
            <Link to="/booking" className="back-button">กลับไปหน้าจอง</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
