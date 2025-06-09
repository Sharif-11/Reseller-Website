import { setUser } from '@sentry/react'
import { useState } from 'react'
import { FiLock, FiPhone } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { customerLogin } from '../Api/auth.api'

interface LoginProps {
  phoneNumber: string
}

const CustomerLogin = ({ phoneNumber }: LoginProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { success, message, data } = await customerLogin({
        phoneNo: phoneNumber,
        password,
      })
      alert(success)
      if (success) {
        localStorage.setItem('token', data?.token)
        setUser(data?.user)
        navigate('/products')
      } else {
        setError(message)
      }
    } catch (error) {
      setError('লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড চেক করুন।')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden'>
        <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white'>
          <h1 className='text-xl font-bold'>লগইন করুন</h1>
          <p className='text-indigo-100 mt-1 text-sm'>আপনার একাউন্টে অ্যাক্সেস পেতে লগইন করুন</p>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm'>{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiPhone />
                মোবাইল নম্বর
              </label>
              <input
                type='text'
                value={phoneNumber}
                readOnly
                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'
              />
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiLock />
                পাসওয়ার্ড
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  লগইন করা হচ্ছে...
                </>
              ) : (
                'লগইন করুন'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerLogin
