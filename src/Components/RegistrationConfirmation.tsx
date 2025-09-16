import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const RegistrationConfirmation = ({
  success,
  message,
  setPage,
}: {
  success: boolean
  message: string
  setPage: React.Dispatch<React.SetStateAction<number>>
}) => {
  const navigate = useNavigate()
  // automatically navigate to /categories#categories after 5 seconds if success is true
  if (success) {
    setTimeout(() => {
      navigate('/products#products')
    }, 1000)
  }

  return (
    <div className='p-6 max-w-md mx-auto text-center'>
      {success ? (
        <div className='bg-green-50 rounded-lg p-6 shadow-md'>
          <div className='flex justify-center mb-4'>
            <FaCheckCircle className='text-green-500 text-5xl' />
          </div>
          <h2 className='text-green-600 text-2xl font-bold mb-2'>কাস্টমার রেজিস্ট্রেশন</h2>
          <p className='text-gray-700 mb-6'>
            আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে। আমাদের পণ্য দেখতে নিচের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={() => navigate('/products#products')}
            className='bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg flex items-center justify-center mx-auto transition-colors'
          >
            প্রোডাক্টস দেখুন <FaArrowRight className='ml-2' />
          </button>
        </div>
      ) : (
        <div className='bg-red-50 rounded-lg p-6 shadow-md'>
          <div className='flex justify-center mb-4'>
            <FaTimesCircle className='text-red-500 text-5xl' />
          </div>
          <h2 className='text-red-600 text-2xl font-bold mb-2'>কাস্টমার রেজিস্ট্রেশন</h2>
          <p className='text-gray-700 mb-4'>{message}</p>
          <p className='text-gray-700 mb-6'>
            দয়া করে আবার চেষ্টা করুন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।
          </p>
          <button
            onClick={() => setPage(0)}
            className='bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg flex items-center justify-center mx-auto transition-colors'
          >
            <FaArrowLeft className='mr-2' /> কাস্টমার রেজিস্ট্রেশন আবার করুন
          </button>
        </div>
      )}
    </div>
  )
}

export default RegistrationConfirmation
