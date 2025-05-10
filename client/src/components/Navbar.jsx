import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {
  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)

  const sendVerficationOtp = async ()=>{
    try {
        axios.defaults.withCredentials =true;

        const { data } = await axios.post(backendUrl +'/api/auth/send-verify-otp')

        if(data.success){
          navigate('/email-verify')
          toast.success(data.message)
        }else{
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const Logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/logout')

      if (data.success) {
        setIsLoggedin(false)
        setUserData(false)
        navigate('/')
        toast.success("Logged out successfully")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-5 sm:px-24 absolute top-0 z-50'>
      <img
        src={assets.logo}
        alt="Logo"
        className='w-28 sm:w-32 cursor-pointer'
        onClick={() => navigate('/')}
      />

      {userData ? (
        <div className='relative w-9 h-9 flex justify-center items-center rounded-full bg-black text-white group cursor-pointer'>
          {userData.name[0].toUpperCase()}

          <div className='absolute top-[110%] right-0 bg-white text-black rounded shadow-md py-2 px-4 w-48 max-w-xs 
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'>
            <ul className='list-none m-0 p-2 bg-gray-100 text-sm rounded'>
              {!userData.isAccountVerified && (
                <li onClick={sendVerficationOtp}className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
                  Verify Email
                </li>
              )}
              <li
                className='py-1 px-2 hover:bg-gray-200 cursor-pointer'
                onClick={Logout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className='flex items-center gap-2 border border-gray-500 rounded-full px-4 py-2 text-gray-800 hover:bg-gray-100 transition-all'
        >
          Login
          <img src={assets.arrow_icon} alt="Arrow" />
        </button>
      )}
    </div>
  )
}

export default Navbar
