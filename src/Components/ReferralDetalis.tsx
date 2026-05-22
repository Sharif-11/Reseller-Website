import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaFacebookF, FaHandHoldingUsd, FaShareAlt, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { FiCheck, FiCopy, FiShare2, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../Hooks/useAuth'
import { shortenUrl } from '../utils/shortenUrl'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

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
      toast.success('কপি হয়েছে!')
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      toast.error('কপি করতে ব্যর্থ হয়েছে')
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
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp} className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>রেফারেল প্রোগ্রাম</h1>
              <p className='text-gray-500 text-sm mt-1'>আপনার কোড শেয়ার করে আয় করুন</p>
            </div>
            <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg'>
              <FaHandHoldingUsd className='h-6 w-6 text-white' />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {/* Referral Code Section */}
          <div className='p-6 border-b border-gray-100'>
            <div className='mb-3'>
              <h2 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
                আপনার রেফারেল কোড
              </h2>
            </div>
            <div className='bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-4 border border-rose-100'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-xl md:text-2xl font-bold text-rose-600 tracking-wider'>
                  {user.referralCode}
                </p>
                <button
                  onClick={() => copyToClipboard(user.referralCode!, 'code')}
                  className='px-3 py-1.5 bg-white rounded-lg text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1 text-sm font-medium shadow-sm'
                >
                  {copiedItem === 'code' ? (
                    <>
                      <FiCheck className='h-4 w-4' />
                      কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <FiCopy className='h-4 w-4' />
                      কপি
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seller Referral Link Section */}
          <div className='p-6 border-b border-gray-100'>
            <h2 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
              সেলারদের জন্য রেফারেল লিংক
            </h2>
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3'>
              <p className='text-xs text-gray-600 break-all font-mono mb-3'>{sellerReferralLink}</p>
              <div className='flex gap-3'>
                <button
                  onClick={() => copyToClipboard(sellerReferralLink, 'sellerLink')}
                  className='flex-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium'
                >
                  {copiedItem === 'sellerLink' ? (
                    <>
                      <FiCheck className='h-4 w-4' />
                      কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <FiCopy className='h-4 w-4' />
                      লিংক কপি
                    </>
                  )}
                </button>
                <button
                  onClick={() => openShareModal('seller')}
                  className='flex-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium shadow-sm'
                >
                  <FaShareAlt className='h-3.5 w-3.5' />
                  শেয়ার করুন
                </button>
              </div>
            </div>
            <div className='bg-amber-50 rounded-xl p-3 border border-amber-100'>
              <p className='text-xs text-amber-700 text-center flex items-center justify-center gap-1'>
                <span>🔗</span> সেলারদের সাথে শেয়ার করে কমিশন আয় করুন
              </p>
            </div>
          </div>

          {/* Customer Referral Link Section */}
          <div className='p-6'>
            <h2 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
              কাস্টমারদের জন্য রেফারেল লিংক
            </h2>
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3'>
              <p className='text-xs text-gray-600 break-all font-mono mb-3'>
                {customerReferralLink}
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => copyToClipboard(customerReferralLink, 'customerLink')}
                  className='flex-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium'
                >
                  {copiedItem === 'customerLink' ? (
                    <>
                      <FiCheck className='h-4 w-4' />
                      কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <FiCopy className='h-4 w-4' />
                      লিংক কপি
                    </>
                  )}
                </button>
                <button
                  onClick={() => openShareModal('customer')}
                  className='flex-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium shadow-sm'
                >
                  <FaShareAlt className='h-3.5 w-3.5' />
                  শেয়ার করুন
                </button>
              </div>
            </div>
            <div className='bg-emerald-50 rounded-xl p-3 border border-emerald-100'>
              <p className='text-xs text-emerald-700 text-center flex items-center justify-center gap-1'>
                <span>💰</span> কাস্টমারদের সাথে শেয়ার করে ৭০% কমিশন পান!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='mt-6 text-center'
        >
          <p className='text-xs text-gray-500'>
            রেফারেল প্রোগ্রাম সম্পর্কে বিস্তারিত জানতে{' '}
            <button
              onClick={navigateToPassiveIncome}
              className='text-rose-500 font-medium hover:text-rose-600 underline-offset-2 hover:underline transition-colors'
            >
              প্যাসিভ ইনকাম প্যানেল
            </button>{' '}
            ভিজিট করুন
          </p>
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50'>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='bg-white rounded-t-2xl w-full max-w-md mx-auto shadow-2xl'
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
              <div>
                <h3 className='text-lg font-semibold text-[#1a1a2e]'>শেয়ার করুন</h3>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {shareLinkType === 'seller' ? 'সেলারদের সাথে' : 'কাস্টমারদের সাথে'} শেয়ার করুন
                </p>
              </div>
              <button
                onClick={closeShareModal}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                <FiX className='text-xl text-gray-400' />
              </button>
            </div>

            {/* Share Options */}
            <div className='p-5'>
              <div className='space-y-3'>
                {/* WhatsApp */}
                <button
                  onClick={() => shareVia('whatsapp')}
                  className='w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all group'
                >
                  <div className='w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform'>
                    <FaWhatsapp className='text-white text-xl' />
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-medium text-gray-800'>WhatsApp</p>
                    <p className='text-xs text-gray-400'>হোয়াটসঅ্যাপে শেয়ার করুন</p>
                  </div>
                  <FiShare2 className='text-gray-300 group-hover:text-gray-500' />
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareVia('facebook')}
                  className='w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all group'
                >
                  <div className='w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform'>
                    <FaFacebookF className='text-white text-xl' />
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-medium text-gray-800'>Facebook</p>
                    <p className='text-xs text-gray-400'>ফেসবুকে শেয়ার করুন</p>
                  </div>
                  <FiShare2 className='text-gray-300 group-hover:text-gray-500' />
                </button>

                {/* Telegram */}
                <button
                  onClick={() => shareVia('telegram')}
                  className='w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all group'
                >
                  <div className='w-11 h-11 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform'>
                    <FaTelegram className='text-white text-xl' />
                  </div>
                  <div className='flex-1 text-left'>
                    <p className='font-medium text-gray-800'>Telegram</p>
                    <p className='text-xs text-gray-400'>টেলিগ্রামে শেয়ার করুন</p>
                  </div>
                  <FiShare2 className='text-gray-300 group-hover:text-gray-500' />
                </button>
              </div>

              {/* Divider */}
              <div className='relative my-5'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-100'></div>
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='px-3 bg-white text-gray-400'>অথবা</span>
                </div>
              </div>

              {/* Quick Copy Message */}
              <button
                onClick={() => {
                  const currentLink =
                    shareLinkType === 'seller' ? sellerReferralLink : customerReferralLink
                  const fullMessage = `আমার রেফারেল কোড ${user.referralCode} ব্যবহার করে রেজিস্টার করুন: ${currentLink}`
                  copyToClipboard(fullMessage, 'message')
                  closeShareModal()
                }}
                className='w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all'
              >
                {copiedItem === 'message' ? (
                  <>
                    <FiCheck className='text-emerald-500 h-4 w-4' />
                    <span className='text-sm font-medium text-gray-700'>মেসেজ কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className='text-gray-500 h-4 w-4' />
                    <span className='text-sm font-medium text-gray-700'>
                      সম্পূর্ণ মেসেজ কপি করুন
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Close Button */}
            <div className='px-5 pb-5 pt-2'>
              <button
                onClick={closeShareModal}
                className='w-full py-2.5 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors'
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ReferralDetails
