import React, { useState, useRef, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);
  const [otp, setOtp] = useState('');
  const inputRefs = useRef([]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = inputRefs.current.map(ref => ref.value).join('');
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setOtp(otpValue);
    setIsOtpSubmited(true);
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    pasteData.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 px-4'>
      <img
        src={assets.logo}
        alt="Logo"
        onClick={() => navigate('/')}
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* Step 1: Email */}
      {!isEmailSent && (
        <form onSubmit={handleEmailSubmit} className='bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md text-sm mb-6'>
          <h1 className='text-xl font-semibold text-white mb-4'>Reset Password</h1>
          <p className='text-indigo-200 mb-6'>Enter your registered email address</p>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" className='w-4 h-4' />
            <input
              type="email"
              placeholder='Email ID'
              className='bg-transparent outline-none text-white w-full'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90 transition mt-3'
          >
            Send OTP
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {isEmailSent && !isOtpSubmited && (
        <form onSubmit={handleOtpSubmit} className='text-center bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 p-8 rounded-lg shadow-lg w-full max-w-md'>
          <h1 className='text-xl font-semibold text-white mb-4'>Verify OTP</h1>
          <p className='text-indigo-200 mb-6'>Check your email for the verification code</p>

          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                required
                className='w-12 h-12 bg-indigo-950 text-white text-center text-xl rounded-md outline-none border border-indigo-600 shadow-sm focus:ring-2 ring-indigo-400'
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            type="submit"
            className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-full hover:opacity-90 transition'
          >
            Submit OTP
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {isOtpSubmited && isEmailSent && (
        <form onSubmit={handleNewPasswordSubmit} className='bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md text-sm mb-6'>
          <h1 className='text-xl font-semibold text-white mb-4'>Set New Password</h1>
          <p className='text-indigo-200 mb-6'>Enter your new password</p>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" className='w-4 h-4' />
            <input
              type="password"
              placeholder='New Password'
              className='bg-transparent outline-none text-white w-full'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90 transition mt-3'
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
