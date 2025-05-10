import React, { useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const { backendUrl, getUserData, isLoggedin, userData } = useContext(AppContent)
  const navigate = useNavigate()
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) {
      navigate('/')
    }
  }, [isLoggedin, userData, navigate])

  const handleInput = (e, index) => {
    const value = e.target.value
    if (!/^[0-9]?$/.test(value)) {
      e.target.value = ''
      return
    }

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }

    const code = inputRefs.current.map(input => input.value.trim()).join('')
    if (code.length === 6 && code.split('').every(c => c !== '')) {
      handleSubmit(code)
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    paste.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })

    if (paste.length === 6) {
      handleSubmit(paste)
    } else {
      inputRefs.current[paste.length]?.focus()
    }
  }

  const handleSubmit = async (code) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp: code })
      if (data.success) {
        toast.success(data.message)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img
        src={assets.logo}
        alt="Logo"
        onClick={() => navigate('/')}
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        className='text-center bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 p-8 rounded-lg shadow-lg w-[90%] max-w-md'
      >
        <h1 className='text-xl font-semibold text-white mb-4'>Enter the 6-digit code</h1>
        <p className='text-indigo-200 mb-6'>We’ve sent a verification code to your email</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              required
              className='w-12 h-12 bg-indigo-950 text-white text-center text-xl rounded-md outline-none border border-indigo-600 shadow-sm focus:ring-2 ring-indigo-400'
              ref={el => inputRefs.current[index] = el}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button
          type="submit"
          className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-full hover:opacity-90 transition'
        >
          Verify Email
        </button>
      </form>
    </div>
  )
}

export default EmailVerify
