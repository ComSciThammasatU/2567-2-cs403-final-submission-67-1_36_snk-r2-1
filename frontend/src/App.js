import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // เพิ่มการ import ที่นี่
import { UserProvider } from './context/UserContext';
import Booking from './Booking';
import Home from './Home';
import Login from './login';
import Logout from './Logout';
import SignUp from './SignUp';
import Review from './Review';
import History from './History';
import BookingConfirmation from './BookingConfirmation';
import BookingDetail from './BookingDetail';


function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />  
      <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/Review" element={<Review />} />
        <Route path="/History" element={<History />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/booking-detail" element={<BookingDetail />} />

      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
