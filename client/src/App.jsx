import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importing pages
import Home from './pages/Home';
import Login from './pages/login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <div>
      {/* Add Toaster for react-hot-toast */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Optional: if you're using react-toastify too */}
      <ToastContainer />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

export default App;
