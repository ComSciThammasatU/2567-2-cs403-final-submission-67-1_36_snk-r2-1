import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import './BookingDetail.css';
import axios from 'axios';

dayjs.locale('th');

const BookingDetail = () => {
  const { state: booking } = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!booking) return <div>ไม่พบข้อมูลการจอง</div>;

  const bookingDateOnly = dayjs(booking.booking_date).format('YYYY-MM-DD');
  const startTimeFormatted = dayjs(`${bookingDateOnly}T${booking.start_time}`).format('HH:mm');
  const endTimeFormatted = dayjs(`${bookingDateOnly}T${booking.end_time}`).format('HH:mm');

  const handleCancelBooking = () => {
    setShowModal(true);
  };

  const confirmCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await axios.patch(`http://localhost:5050/api/bookings/${booking.id}/cancel`);
      alert('✅ ยกเลิกการจองเรียบร้อยแล้ว');
      navigate('/history');
    } catch (error) {
      console.error('❌ ยกเลิกไม่สำเร็จ:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setShowModal(false);
      setIsCancelling(false);
    }
  };

  return (
    <div className="app-container">
      <div className="booking-navbar">
        <span className="welcome-text">ยินดีต้อนรับสู่ระบบ การจองกระจกยิมเนเซียม 7 . . .</span>
      </div>
      <div className="navbar-2">
        <span>รายละเอียดการจอง</span>
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

      <div className="main-content-booking">
        <div className="confirmation-container">
          <h2 className="confirmation-title">รายละเอียดการจอง</h2>
          <div className="confirmation-details">
            {/* แสดงรายละเอียดต่าง ๆ */}
            <div className="confirmation-item">
              <span className="confirmation-label">ชื่อกิจกรรม:</span>
              <span className="confirmation-value">{booking.event_name}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">ชื่อผู้จอง:</span>
              <span className="confirmation-value">{booking.booker_name}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">Zone:</span>
              <span className="confirmation-value">{booking.court_name}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">วันที่จอง:</span>
              <span className="confirmation-value">{dayjs(booking.booking_date).format('D MMMM ')}</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">เวลาเริ่ม:</span>
              <span className="confirmation-value">{startTimeFormatted} น.</span>
            </div>
            <div className="confirmation-item">
              <span className="confirmation-label">เวลาสิ้นสุด:</span>
              <span className="confirmation-value">{endTimeFormatted} น.</span>
            </div>
          </div>

          <div className="button-group-container">
            <Link to="/history" className="action-button back-button">กลับไปหน้าประวัติ</Link>
            <button className="action-button cancel-button" onClick={handleCancelBooking}>ยกเลิกการจอง</button>
          </div>
        </div>
      </div>

      {/* ยืนยันการยกเลิก */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} disabled={isCancelling}>ไม่</button>
              <button onClick={confirmCancelBooking} disabled={isCancelling}>ใช่</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
