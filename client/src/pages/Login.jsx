import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // 👈 New state

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      axios.defaults.withCredentials = true

      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password })
        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password })
        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img
        src={assets.logo}
        alt="Logo"
        onClick={() => navigate('/')}
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>

        <p className='mb-6 text-center'>
          {state === 'Sign Up' ? 'Create your Account' : 'Login to your Account'}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className='bg-transparent outline-none w-full'
                required
              />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='bg-transparent outline-none w-full'
              required
            />
          </div>

          {/* ✅ Password with Show/Hide toggle */}
          <div className='mb-4 relative flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='bg-transparent outline-none w-full pr-12'
              required
            />
            <span
              onClick={() => setShowPassword(prev => !prev)}
              className='absolute right-5 text-xs text-blue-400 cursor-pointer'
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          <p
            onClick={() => navigate('/reset-password')}
            className='mb-4 text-indigo-500 cursor-pointer'
          >
            Forgot Password?
          </p>

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an Account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-blue-400 cursor-pointer underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an Account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-blue-400 cursor-pointer underline'
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
