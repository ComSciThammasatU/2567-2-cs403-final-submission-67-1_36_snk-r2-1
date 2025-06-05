import React, { useState, useEffect } from "react";
import './Booking.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewDay } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");


const Booking = () => {
  const navigate = useNavigate(); 

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [courtEvents, setCourtEvents] = useState({});

  
  const [courts] = useState([
    { id: 1, name: "Zone A", imageUrl: "https://i.postimg.cc/wvY9wwWk/IMG-8456.avif", description: "ใช้กระจกได้ 5 บาน / Zone", available: true },
    { id: 2, name: "Zone B", imageUrl: "https://i.postimg.cc/fRM2fmj0/IMG-8454.avif", description: "ใช้กระจกได้ 5 บาน / Zone", available: true },
    { id: 3, name: "Zone C", imageUrl: "https://i.postimg.cc/ZqMwmgkr/IMG-8455.avif", description: "ใช้กระจกได้ 5 บาน / Zone", available: true },
    { id: 4, name: "Zone D", imageUrl: "https://i.postimg.cc/1tz1CbGw/IMG-8458.avif", description: "ใช้กระจกได้ 5 บาน / Zone", available: true },
  ]);


  // ==================== Fetch Bookings ====================
  const fetchBookingsForCourt = async (court, date) => {
    try {
      // แปลงวันที่เป็น YYYY-MM-DD ใน timezone Bangkok
      const bangkokDate = dayjs(date).tz('Asia/Bangkok').format('YYYY-MM-DD');
  
      const response = await fetch(`http://localhost:5050/api/bookings?court=${encodeURIComponent(court)}&date=${bangkokDate}`);
      const data = await response.json();
      console.log("📥 Booking data:", data);
  
      const newEvents = data.map(b => {
        if (b.status === 'ยกเลิก') return null;
  
        const bookingDateOnly = dayjs.utc(b.booking_date).tz('Asia/Bangkok').format('YYYY-MM-DD');
        const startDateTime = `${bookingDateOnly} ${b.start_time}`;
        const endDateTime = `${bookingDateOnly} ${b.end_time}`;
  
        const start = dayjs.tz(startDateTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Bangkok');
        const end = dayjs.tz(endDateTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Bangkok');
  
        return {
          id: String(b.id),
          title: `${b.event_name} - ${b.booker_name}`,
          start: start.format('YYYY-MM-DD HH:mm'),
          end: end.format('YYYY-MM-DD HH:mm'),
        };
      }).filter(event => event !== null);
  
      eventsService.set([]);
      newEvents.forEach(event => eventsService.add(event));
      setEvents(newEvents);
  
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
    }
  };
  
  
  
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const [eventsService] = useState(() => createEventsServicePlugin());
  const [events, setEvents] = useState([]);

  const calendar = useCalendarApp({
    views: [createViewDay()],
    plugins: [eventsService],
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      console.log("🔐 Logged in as:", storedUser.username);
    } else {
      console.log("❌ ไม่พบข้อมูลผู้ใช้ใน localStorage");
    }
  }, []);
  

  useEffect(() => {
    if (eventsService) {
      const allEvents = eventsService.getAll();
      setEvents(allEvents);
    }
  }, [eventsService]);


  const handleSearch = () => {
    if (!selectedDate) {
      alert("กรุณาเลือกวันที่ก่อนค้นหา");
      return;
    }
    const formattedDate = dayjs(selectedDate).tz('Asia/Bangkok').format('YYYY-MM-DD');
    console.log("✅ วันที่ที่เลือก:", formattedDate);
    if (selectedCourt) {
      fetchBookingsForCourt(selectedCourt, formattedDate); // โหลด event ใหม่
    }
  };
  
  

  const handleBooking = (courtName) => {
    console.log("🟢 เริ่มจอง:", courtName);
    if (!selectedDate) {
      alert("กรุณาเลือกวันที่ก่อนจอง");
      return;
    }
    setSelectedCourt(courtName);
    setShowCalendar(true);
    console.log("✅ เปิดตารางเวลา");

    const formattedDate = dayjs(selectedDate).tz('Asia/Bangkok').format('YYYY-MM-DD');
  fetchBookingsForCourt(courtName, formattedDate); 
  };
  

  const handleSlotClick = (start, end) => {
    console.log("🕓 เลือกช่วงเวลา:", start, "-", end);
  
    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    const startDateTime = dayjs.tz(`${dateStr} ${start}`, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok');
    const endDateTime = dayjs.tz(`${dateStr} ${end}`, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok');
  
    setSelectedSlot({ start: startDateTime, end: endDateTime });
    setShowCalendar(false);
    setShowTimeForm(true);
  };
  

  const formatTime = (time) => {
    if (!time) return null;
  
    if (dayjs.isDayjs(time)) return time.format('HH:mm:ss');
    if (time instanceof Date) return dayjs(time).format('HH:mm:ss');
    if (typeof time === 'string') {
      const parsed = dayjs(time, 'HH:mm');
      if (parsed.isValid()) return parsed.format('HH:mm:ss');
      console.warn("Time format invalid:", time);
      return null;
    }
    return null;
  };
  

  const handleSubmitBooking = () => {

    if (!eventName || !bookerName || !phoneNumber || !selectedSlot) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

   const date = dayjs(selectedDate).tz('Asia/Bangkok').format('YYYY-MM-DD');
  
  // ใช้ฟังก์ชัน formatTime แปลงเวลาที่ได้จาก selectedSlot
  const startTimeFormatted = formatTime(selectedSlot.start);
  const endTimeFormatted = formatTime(selectedSlot.end);

  console.log('Formatted times:', startTimeFormatted, endTimeFormatted);

  if (!startTimeFormatted || !endTimeFormatted) {
    alert("เวลาที่เลือกไม่ถูกต้อง");
    return;
  }
  // เช็คเวลา start < end (เพิ่มเช็คนี้เพื่อป้องกันเวลาผิด)
  if (
    dayjs(startTimeFormatted, 'HH:mm:ss').isAfter(dayjs(endTimeFormatted, 'HH:mm:ss')) ||
    startTimeFormatted === endTimeFormatted
  ) {
    alert("⚠️ เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
    return;
  }

    const bookingData = {
      userId: user?.id,
      event_name: eventName,
      court_name: selectedCourt,
      booking_date: date,
      start_time: startTimeFormatted,
      end_time: endTimeFormatted,
      booker_name: bookerName,
      phone_number: phoneNumber,
      phone_number2: phoneNumber2,

    };
  
    console.log("📦 ส่งข้อมูลการจองไปยัง backend:", bookingData);

  
    fetch('http://localhost:5050/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
   
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Booking error:", data.message);
        alert(data.message || "เกิดข้อผิดพลาดในการจอง");
        return; 
      }

      const newEvent = {
        id: String(Date.now()),
        title: `${eventName} - ${selectedCourt}`,
        start: dayjs.tz(`${date} ${startTimeFormatted}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Bangkok').format('YYYY-MM-DD HH:mm'),
        end: dayjs.tz(`${date} ${endTimeFormatted}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Bangkok').format('YYYY-MM-DD HH:mm'),
      };      
      
  
      eventsService.add(newEvent);
      setEvents((prev) => [...prev, newEvent]);
  
      console.log("✅ จองสำเร็จ:", data);
      alert(data.message || "จองสำเร็จ");

      setShowTimeForm(false);
      setEventName('');
      setBookerName('');
      setPhoneNumber('');
      setPhoneNumber2('');

      
    // ไปหน้า booking-confirmation เฉพาะเมื่อจองสำเร็จ
    navigate('/booking-confirmation', {
      state: {
        eventName,
        bookerName,
        selectedCourt,
        bookingDate: date,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
      }
    });
  })
  .catch(err => {
    console.error("❌ เกิดข้อผิดพลาดในการจอง:", err);
    alert("เกิดข้อผิดพลาดในการจอง");
  });
  }





  return (
    <div className="app-container">
      <div className="booking-navbar">
        <span className="welcome-text">ยินดีต้อนรับสู่ระบบ การจองกระจกยิมเนเซียม 7 . . .</span>
      </div>

      <div className="navbar-2">
        <span>จองกระจกยิมเนเซียม 7</span>
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
      <div className="main-content-booking">
      <div className="booking-container">
  {/* เลือกวันที่ */}
  <div className="date-card">
    <label htmlFor="date-input" className="date-label">เลือกวันที่ต้องการจอง :</label>

    <div className="date-input-group">
      <input
        id="date-input"
        type="text"
        readOnly
        value={selectedDate ? selectedDate.toLocaleDateString('th-TH') : ''}
        onClick={() => setShowDatePicker(true)}
        className="date-input"
        placeholder="คลิกเพื่อเลือกวันที่"
        
      />

      <button className="search-button" onClick={handleSearch}>ค้นหา</button>
    </div>

    {showDatePicker && (
      <div className="calendar-popup">
        <Calendar
          onChange={(date) => {
            setSelectedDate(date);
            setShowDatePicker(false);
          }}
          value={selectedDate}
          minDate={new Date()}
          locale="th-TH"
          calendarType="iso8601"
        />
      </div>
    )}
  </div>



                 {/* รายการโซน */}
          <div className="court-list">
            {courts.map((court) => (
              <div className="court-item" key={court.id}>
                <img src={court.imageUrl} alt={court.name} className="court-image" />
                <div className="court-info">
                  <h3>{court.name}</h3>
                  <p className="court-description">{court.description}</p>
                  <p><strong>สถานะ:</strong> {court.available ? "ว่าง" : "ไม่ว่าง"}</p>
                  <button
                    disabled={!court.available}
                    className={court.available ? "available-button" : "unavailable-button"}
                    onClick={() => handleBooking(court.name)}
                  >
                    {court.available ? "จอง" : "เต็ม"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ตารางเวลา */}
      <Modal
        isOpen={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
        className="calendar-modal"
        overlayClassName="calendar-overlay"
        ariaHideApp={false}
      >
        <div className="calendar-modal-header">
          <button onClick={() => setShowCalendar(false)} className="close-modal-button">&times;</button>
        </div>
        <div className="time-grid">
          <h3>ตารางเวลาในวัน {selectedDate?.toLocaleDateString('th-TH')}</h3>
          <div className="time-grid-table">
          {selectedDate && Array.from({ length: 12 }, (_, index) => {
      const hour = 9 + index;
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const fullStart = `${dateStr} ${start}`;
      const fullEnd = `${dateStr} ${end}`;
      
      const isBooked = events.some((event) => event.start === fullStart && event.end === fullEnd);
      const bookedEvent = events.find((event) => event.start === fullStart && event.end === fullEnd);

     const now = dayjs().tz('Asia/Bangkok');
     const slotStartTime = dayjs.tz(fullStart, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok');
      const isPast = slotStartTime.isBefore(now);

  return (
    <div
      key={start}
      className={`time-slot ${isBooked ? 'booked' : isPast ? 'disabled' : 'available'}`}
      onClick={() => !isBooked && !isPast && handleSlotClick(start, end)}
    >
      <span className="time-range">{start} - {end}</span>
      {isBooked && bookedEvent && (
        <span className="booked-message">จองแล้ว <br />(คุณ{bookedEvent.title.split(' - ')[1]})</span>
      )}

      {isPast && !isBooked && (
        <span className="booked-message">เลยเวลา</span>
      )}
      {!isBooked && !isPast && (
    <span className="booked-message">ว่าง</span>
      )}
    </div>
  );
})}

          </div>
        </div>
      </Modal>

      {/* ฟอร์มจอง */}
      <Modal
        isOpen={showTimeForm}
        onRequestClose={() => setShowTimeForm(false)}
        className="form-modal"
        overlayClassName="calendar-overlay"
        ariaHideApp={false}
      >
        <div className="calendar-modal-header">
          <button onClick={() => setShowTimeForm(false)} className="close-modal-button">&times;</button>
        </div>
        <div className="form-container">
          <h2>กรอกข้อมูลการจอง</h2>
          <div className="form-group">
            <label>ชื่อกิจกรรม</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>ชื่อผู้จอง</label>
            <input type="text" value={bookerName} onChange={(e) => setBookerName(e.target.value)} />
          </div>
          <div className="form-group">
  <label>เบอร์โทรศัพท์</label>
  <input
    type="text"
    value={phoneNumber}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d{0,10}$/.test(value)) {
        setPhoneNumber(value);
      }
    }}
    placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
  />
</div>

<div className="form-group">
  <label>เบอร์โทรศัพท์ (สำรอง)</label>
  <input
    type="text"
    value={phoneNumber2}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d{0,10}$/.test(value)) {
        setPhoneNumber2(value);
      }
    }}
    placeholder="กรอกเบอร์โทรศัพท์สำรอง 10 หลัก"
  />
</div>

          <button className="submit-button" onClick={handleSubmitBooking}>ยืนยันการจอง</button>
        </div>
      </Modal>
    </div>
  );
};

export default Booking;

