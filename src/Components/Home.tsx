import { MessageCircle } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../Hooks/useAuth'
import DashboardLayout from './Dashboard'

const Home = () => {
  const { user } = useAuth()
  const location = useLocation()
  const handleSupportClick = () => {
    // Replace this URL with your actual messenger group link
    // For example: Facebook Messenger, WhatsApp, Telegram, etc.
    const messengerGroupUrl = 'https://m.me/678681205334435?source=qr_link_share' // Facebook Messenger
    // const messengerGroupUrl = 'https://wa.me/1234567890' // WhatsApp
    // const messengerGroupUrl = 'https://t.me/your-group' // Telegram

    window.open(messengerGroupUrl, '_blank')
  }

  let iconVisible = user
    ? location.pathname === '/home' || location.pathname === '/support'
    : !(location.pathname.startsWith('/products') || location.pathname.startsWith('/categories'))

  return (
    <div className='relative'>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>

      {/* Fixed Customer Support Icon */}
      {iconVisible && (
        <button
          onClick={handleSupportClick}
          className='fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group'
          aria-label='গ্রাহক সহায়তা - মেসেঞ্জারে আমাদের সাথে যোগাযোগ করুন'
          title='সাহায্য প্রয়োজন? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন'
        >
          <MessageCircle className='w-6 h-6' />

          {/* Optional tooltip */}
          <span className='absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap'>
            সাপোর্টে যোগাযোগ করুন
          </span>
        </button>
      )}
    </div>
  )
}

export default Home
