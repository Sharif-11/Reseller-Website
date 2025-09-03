import { useEffect, useState } from 'react'
import { FaFacebookF, FaHandHoldingUsd, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { FiCheck, FiCopy, FiShare2, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Hooks/useAuth'
import { shortenUrl } from '../utils/shortenUrl'

export const ReferralDetails = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copiedItem, setCopiedItem] = useState<
    'code' | 'sellerLink' | 'customerLink' | 'message' | null
  >(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLinkType, setShareLinkType] = useState<'seller' | 'customer'>('seller')
  const [sellerReferralLink, setSellerReferralLink] = useState<string>('')
  const [customerReferralLink, setCustomerReferralLink] = useState<string>('')

  if (!user?.referralCode) {
    return null
  }

  const copyToClipboard = async (
    text: string,
    type: 'code' | 'sellerLink' | 'customerLink' | 'message'
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(type)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const openShareModal = (type: 'seller' | 'customer') => {
    setShareLinkType(type)
    setShowShareModal(true)
  }

  const closeShareModal = () => {
    setShowShareModal(false)
  }

  const shareVia = (platform: 'whatsapp' | 'facebook' | 'telegram') => {
    const currentLink = shareLinkType === 'seller' ? sellerReferralLink : customerReferralLink
    const shareText = `আমার রেফারেল কোড ${user.referralCode} ব্যবহার করে রেজিস্টার করুন`
    const shareUrl = currentLink

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}: ${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer')
      setShowShareModal(false)
    }
  }

  const navigateToPassiveIncome = () => {
    navigate('/passive-income')
  }
  useEffect(() => {
    const sellerLink = `${window.location.origin}/register?ref=${user.referralCode}`
    const customerLink = `${window.location.origin}/customer-register?customer_ref=${user.referralCode}`
    const shortUrl = async () => {
      const link1 = sellerLink
      const link2 = await shortenUrl(customerLink)
      setSellerReferralLink(link1)
      setCustomerReferralLink(link2)
    }
    shortUrl()
  }, [user])

  return (
    <div className='p-2 relative'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-4 text-white shadow-sm mb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FaHandHoldingUsd className='text-lg' />
              <h1 className='text-lg font-bold'>রেফারেল প্রোগ্রাম</h1>
            </div>
          </div>
          <p className='text-indigo-100 mt-1 text-xs'>আপনার কোড শেয়ার করে আয় করুন</p>
        </div>

        {/* Content */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          {/* Referral Code Section */}
          <div className='p-3 border-b'>
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-sm font-medium text-gray-700'>আপনার রেফারেল কোড</h2>
            </div>
            <div className='flex items-center justify-between bg-indigo-50 p-3 rounded-lg'>
              <div className='flex-1'>
                <p className='text-lg font-bold text-indigo-800 tracking-wider'>
                  {user.referralCode}
                </p>
                <p className='text-xs text-indigo-600 mt-1'>শুধুমাত্র কোড শেয়ার করুন</p>
              </div>
              <button
                onClick={() => user.referralCode && copyToClipboard(user.referralCode, 'code')}
                className='text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors'
              >
                {copiedItem === 'code' ? <FiCheck className='text-green-200' /> : <FiCopy />}
                {copiedItem === 'code' ? 'কপি হয়েছে!' : 'কোড কপি করুন'}
              </button>
            </div>
          </div>

          {/* Seller Referral Link Section */}
          <div className='p-3 border-b'>
            <h2 className='text-sm font-medium text-gray-700 mb-2'>
              সেলারদের সাথে শেয়ার করার লিংক
            </h2>
            <div className='bg-gray-50 p-3 rounded-lg mb-3'>
              <p className='text-xs text-gray-600 break-all mb-2'>{sellerReferralLink}</p>
              <div className='flex gap-2'>
                <button
                  onClick={() => copyToClipboard(sellerReferralLink, 'sellerLink')}
                  className='flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors'
                >
                  {copiedItem === 'sellerLink' ? (
                    <FiCheck className='text-green-200' />
                  ) : (
                    <FiCopy />
                  )}
                  {copiedItem === 'sellerLink' ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}
                </button>
                <button
                  onClick={() => openShareModal('seller')}
                  className='flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors'
                >
                  <FiShare2 /> শেয়ার করুন
                </button>
              </div>
            </div>
            <div className='bg-yellow-50 border border-yellow-200 p-2 rounded-lg'>
              <p className='text-xs text-yellow-800 text-center'>
                🔗 সেলারদের সাথে রেফারেল লিংক শেয়ার করে আয় করুন
              </p>
            </div>
          </div>

          {/* Customer Referral Link Section */}
          <div className='p-3'>
            <h2 className='text-sm font-medium text-gray-700 mb-2'>
              কাস্টমারদের সাথে শেয়ার করার লিংক
            </h2>
            <div className='bg-gray-50 p-3 rounded-lg mb-3'>
              <p className='text-xs text-gray-600 break-all mb-2'>{customerReferralLink}</p>
              <div className='flex gap-2'>
                <button
                  onClick={() => copyToClipboard(customerReferralLink, 'customerLink')}
                  className='flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors'
                >
                  {copiedItem === 'customerLink' ? (
                    <FiCheck className='text-green-200' />
                  ) : (
                    <FiCopy />
                  )}
                  {copiedItem === 'customerLink' ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}
                </button>
                <button
                  onClick={() => openShareModal('customer')}
                  className='flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors'
                >
                  <FiShare2 /> শেয়ার করুন
                </button>
              </div>
            </div>
            <div className='bg-green-50 border border-green-200 p-2 rounded-lg'>
              <p className='text-xs text-green-800 text-center'>
                💰 কাস্টমারদের সাথে শেয়ার করে ৭০% কমিশন পান!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className='mt-2 p-3 bg-white rounded-lg shadow-sm'>
          <p className='text-xs text-gray-600 text-center'>
            রেফারেল প্রোগ্রাম সম্পর্কে বিস্তারিত জানতে{' '}
            <button
              onClick={navigateToPassiveIncome}
              className='text-indigo-600 font-medium hover:text-indigo-700 underline'
            >
              প্যাসিভ ইনকাম প্যানেল
            </button>{' '}
            ভিজিট করুন
          </p>
        </div>
      </div>

      {/* Enhanced Share Modal */}
      {showShareModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50'>
          <div className='bg-white rounded-t-xl w-full max-w-md mx-2 mb-0 animate-slide-up'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-4 border-b'>
              <h3 className='text-lg font-semibold text-gray-900'>শেয়ার করুন</h3>
              <button
                onClick={closeShareModal}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <FiX className='text-xl text-gray-500' />
              </button>
            </div>

            {/* Share Options */}
            <div className='p-4'>
              <p className='text-sm text-gray-600 mb-4 text-center'>
                আপনার রেফারেল লিংকটি শেয়ার করার জন্য একটি প্ল্যাটফর্ম বেছে নিন
              </p>

              <div className='grid grid-cols-1 gap-3'>
                <button
                  onClick={() => shareVia('whatsapp')}
                  className='flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors'
                >
                  <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center'>
                    <FaWhatsapp className='text-white text-lg' />
                  </div>
                  <div className='text-left flex-1'>
                    <p className='font-medium text-gray-900'>WhatsApp</p>
                    <p className='text-sm text-gray-600'>হোয়াটসঅ্যাপের মাধ্যমে শেয়ার করুন</p>
                  </div>
                </button>

                <button
                  onClick={() => shareVia('facebook')}
                  className='flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors'
                >
                  <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center'>
                    <FaFacebookF className='text-white text-lg' />
                  </div>
                  <div className='text-left flex-1'>
                    <p className='font-medium text-gray-900'>Facebook</p>
                    <p className='text-sm text-gray-600'>ফেসবুকে শেয়ার করুন</p>
                  </div>
                </button>

                <button
                  onClick={() => shareVia('telegram')}
                  className='flex items-center gap-3 p-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors'
                >
                  <div className='w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center'>
                    <FaTelegram className='text-white text-lg' />
                  </div>
                  <div className='text-left flex-1'>
                    <p className='font-medium text-gray-900'>Telegram</p>
                    <p className='text-sm text-gray-600'>টেলিগ্রামে শেয়ার করুন</p>
                  </div>
                </button>
              </div>

              {/* Quick Copy Section */}
              <div className='mt-4 pt-4 border-t'>
                <p className='text-sm text-gray-600 mb-2'>অথবা দ্রুত কপি করুন:</p>
                <button
                  onClick={() => {
                    const currentLink =
                      shareLinkType === 'seller' ? sellerReferralLink : customerReferralLink
                    copyToClipboard(
                      `আমার রেফারেল কোড ${user.referralCode} ব্যবহার করে রেজিস্টার করুন: ${currentLink}`,
                      'message'
                    )
                    closeShareModal()
                  }}
                  className='w-full p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-center transition-colors'
                >
                  <div className='flex items-center justify-center gap-2'>
                    {copiedItem === 'message' ? <FiCheck className='text-green-600' /> : <FiCopy />}
                    <span className='text-sm font-medium'>
                      {copiedItem === 'message' ? 'মেসেজ কপি হয়েছে!' : 'সম্পূর্ণ মেসেজ কপি করুন'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ReferralDetails
