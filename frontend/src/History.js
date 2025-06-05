import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './History.css';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { FaInfoCircle, FaFilter } from 'react-icons/fa';

dayjs.locale('th');

const History = () => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDropdown, setShowDropdown] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const navigate = useNavigate();

  const formatFullDateTime = (date, time) => {
    if (!date || !time) return 'ไม่ระบุเวลา';
    const dateOnly = dayjs(date).format('YYYY-MM-DD');
    return dayjs(`${dateOnly}T${time}`).format('HH:mm');
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5050/api/user-bookings?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookingHistory(data);
      } catch (error) {
        console.error('Error fetching booking history:', error);
        setBookingHistory([]);
      }
    };
    fetchBookings();
  }, [userId]);

  const sortedBookings = [...bookingHistory].sort((a, b) => {
    const dateA = new Date(a.booking_date);
    const dateB = new Date(b.booking_date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const changeSort = (order) => {
    setSortOrder(order);
    setShowDropdown(false);
  };

  const handleInfoClick = (booking) => {
    navigate('/booking-detail', { state: booking });
  };

  // ซ่อน dropdown เมื่อคลิกข้างนอก (optional)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-sort') && !event.target.closest('.filter-icon')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="review-page">
      {/* Navbar */}
      <div className="navbar"></div>

      {/* Main layout */}
      <div className="main-content-history">
        <div className="history-navbar">
          <span className="welcome-text">ยินดีต้อนรับสู่ระบบ การจองกระจกยิมเนเซียม 7 . . .</span>
        </div>

        <div className="navbar-history">
          <span>ประวัติการจอง</span>
        </div>

        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="content">
          <h3>Booking History</h3>
          <div className="booking-history">
            {bookingHistory.length === 0 ? (
              <p>คุณยังไม่มีการจองกิจกรรม</p>
            ) : (
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>ลำดับที่</th>
                    <th>กิจกรรม</th>
                    <th>โซน</th>
                    <th style={{ position: 'relative' }}>
                      วันที่จอง
                      <img
    src="https://cdn-icons-png.flaticon.com/512/3839/3839020.png"
    alt="Filter Icon"
    style={{ width: '16px', height: '16px', marginLeft: '8px', cursor: 'pointer', verticalAlign: 'middle' }}
    onClick={() => setShowDropdown(prev => !prev)}
    className="filter-icon"
    title="กรองการเรียงลำดับ"
  />
                      {showDropdown && (
                        <div className="dropdown-sort">
                          <div onClick={() => changeSort('asc')}>เก่าสุด → ใหม่สุด</div>
                          <div onClick={() => changeSort('desc')}>ใหม่สุด → เก่าสุด</div>
                        </div>
                      )}
                    </th>
                    <th>เวลาเริ่ม</th>
                    <th>เวลาสิ้นสุด</th>
                    <th>สถานะการจอง</th>
                    <th>รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{booking.event_name}</td>
                      <td>{booking.court_name}</td>
                      <td>{dayjs(booking.booking_date).format('DD MMM YYYY')}</td>
                      <td>{formatFullDateTime(booking.booking_date, booking.start_time)}</td>
                      <td>{formatFullDateTime(booking.booking_date, booking.end_time)}</td>
                      <td>
                        {booking.status === 'cancelled' || booking.status === 'ยกเลิก' ? (
                          <span style={{ color: 'red', fontWeight: 'bold' }}>ยกเลิก</span>
                        ) : (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>ยืนยัน</span>
                        )}
                      </td>
                      <td>
                        <FaInfoCircle
                          className="icon-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInfoClick(booking);
                          }}
                          title="ดูรายละเอียด"
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
