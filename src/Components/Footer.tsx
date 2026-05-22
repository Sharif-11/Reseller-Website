// Footer.tsx — Fixed: scroll-to-top on all navigation links
import { cubicBezier, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaArrowUp,
  FaCreditCard,
  FaEnvelope,
  FaFacebook,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaQuestionCircle,
  FaShieldAlt,
  FaTelegram,
  FaTruck,
  FaWhatsapp,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/sbr.png'
import { useAuth } from '../Hooks/useAuth'

/* ── Scroll-to-top navigation helper ── */
const useNavWithScroll = () => {
  const navigate = useNavigate()
  return (path: string) => {
    navigate(path)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }
}

/* ── Scroll-to-section helper (same page hash) ── */
const scrollToSection = (hash: string) => {
  const id = hash.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  } else {
    // Fallback: scroll to top if section not found
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const Footer = () => {
  const { customerMode } = useAuth()
  const navTo = useNavWithScroll()
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const trustFeatures = [
    { icon: FaTruck, label: 'দ্রুত ডেলিভারি', sub: '২৪–৪৮ ঘণ্টায় সারা দেশে' },
    { icon: FaShieldAlt, label: 'নিরাপদ পেমেন্ট', sub: 'SSL সুরক্ষিত লেনদেন' },
    { icon: FaCreditCard, label: 'মোবাইল পেমেন্ট', sub: 'বিকাশ ও নগদ সুবিধা' },
  ]

  const socials = [
    {
      icon: FaFacebook,
      href: 'https://www.facebook.com/profile.php?id=61578209851119&mibextid=ZbWKwL',
      label: 'Facebook',
    },
    { icon: FaTelegram, href: 'https://t.me/+xUKRYo264jU5Njg1', label: 'Telegram' },
    {
      icon: FaWhatsapp,
      href: 'https://chat.whatsapp.com/Gs5lCd3OBDM69bnv0h8Jc0?mode=ac_t',
      label: 'WhatsApp',
    },
  ]

  const linkClass =
    'group flex items-center gap-2 text-[13px] text-white/45 transition-colors hover:text-white'

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.5, delay: 0.1, ease: cubicBezier(0.22, 1, 0.36, 1) },
  }

  return (
    <>
      <footer className='relative overflow-hidden bg-[#1a1a2e]'>
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className='pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#e94560]/[0.04]' />
        <div className='pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-white/[0.02]' />

        <div className='relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8'>
          {/* ── Trust Strip ── */}
          <div className='grid grid-cols-2 gap-3 border-b border-white/[0.06] py-8 sm:grid-cols-4'>
            {trustFeatures.map((feat, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className='flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e94560]/12'>
                  <feat.icon className='h-4 w-4 text-[#e94560]' />
                </div>
                <div>
                  <p className='text-[13px] font-medium text-white/80'>{feat.label}</p>
                  <p className='text-[11px] text-white/35'>{feat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Main Footer Columns ── */}
          <div className='grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8'>
            {/* Brand column */}
            <motion.div {...fadeUp} className='lg:col-span-4'>
              <div className='mb-5'>
                <img
                  src={logo}
                  alt='BazaarHub'
                  className='h-9 w-auto cursor-pointer object-contain transition duration-200 hover:opacity-80'
                  style={{ background: 'transparent' }}
                  onClick={() => navTo('/')}
                />
              </div>

              <p className='mb-6 max-w-xs text-[13px] leading-[1.75] text-white/40'>
                {customerMode
                  ? 'বাংলাদেশের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। গুণগত পণ্য ও সেবার জন্য আমাদের বিশ্বস্ত করুন।'
                  : 'বাংলাদেশের নির্ভরযোগ্য ড্রপশিপিং ও রিসেলিং প্ল্যাটফর্ম। আমরা আপনার ব্যবসার সফলতার জন্য প্রতিশ্রুতিবদ্ধ।'}
              </p>

              <p className='mb-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white/25'>
                আমাদের অনুসরণ করুন
              </p>
              <div className='flex gap-2'>
                {socials.map((s, i) => (
                  <motion.a
                    key={i}
                    href={s.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={s.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.93 }}
                    className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white'
                  >
                    <s.icon className='h-3.5 w-3.5' />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.08 }}
              className='lg:col-span-2'
            >
              <p className='mb-5 text-[11px] font-semibold uppercase tracking-[0.7px] text-white/30'>
                {customerMode ? 'গুরুত্বপূর্ণ লিংক' : 'দ্রুত লিংক'}
              </p>
              <ul className='space-y-3'>
                {customerMode ? (
                  <>
                    <li>
                      <button onClick={() => navTo('/products')} className={linkClass}>
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        সকল পণ্য
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('#how-to-order')}
                        className={linkClass}
                      >
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        কিভাবে অর্ডার করবেন
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button onClick={() => navTo('/about-us')} className={linkClass}>
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        আমাদের সম্পর্কে
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navTo('/products')} className={linkClass}>
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        প্রোডাক্টসমূহ
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navTo('/how-it-works')} className={linkClass}>
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        কিভাবে কাজ করে
                      </button>
                    </li>
                    <li>
                      <button onClick={() => navTo('/faq')} className={linkClass}>
                        <FaQuestionCircle className='h-3 w-3 shrink-0 text-white/25 transition group-hover:text-[#e94560]' />
                        সচরাচর প্রশ্ন
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Legal / Policy links (seller mode only) */}
            {!customerMode && (
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.12 }}
                className='lg:col-span-2'
              >
                <p className='mb-5 text-[11px] font-semibold uppercase tracking-[0.7px] text-white/30'>
                  নীতিমালা
                </p>
                <ul className='space-y-3'>
                  {[
                    { path: '/privacy-policy', label: 'প্রাইভেসি পলিসি' },
                    { path: '/return-refund-policy', label: 'রিটার্ন ও রিফান্ড' },
                    { path: '/terms-conditions', label: 'টার্মস ও কন্ডিশন' },
                  ].map((link, i) => (
                    <li key={i}>
                      <button onClick={() => navTo(link.path)} className={linkClass}>
                        <span className='h-px w-3 bg-[#e94560]/50 transition group-hover:w-4 group-hover:bg-[#e94560]' />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Contact Info */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.16 }}
              className='lg:col-span-4'
            >
              <p className='mb-5 text-[11px] font-semibold uppercase tracking-[0.7px] text-white/30'>
                যোগাযোগ
              </p>
              <div className='space-y-4'>
                {[
                  { icon: FaPhoneAlt, label: 'ফোন', value: '09638755704', href: 'tel:09638755704' },
                  {
                    icon: FaEnvelope,
                    label: 'ইমেইল',
                    value: 'support@shopbdresellerjob.com',
                    href: 'mailto:support@shopbdresellerjob.com',
                  },
                  {
                    icon: FaMapMarkerAlt,
                    label: 'ঠিকানা',
                    value: 'চট্টগ্রাম, বাংলাদেশ',
                    href: null,
                  },
                ].map((item, i) => (
                  <div key={i} className='flex items-start gap-3'>
                    <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5'>
                      <item.icon className='h-3 w-3 text-[#e94560]' />
                    </div>
                    <div>
                      <p className='text-[10px] font-medium uppercase tracking-[0.4px] text-white/25'>
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className='text-[13px] text-white/55 transition hover:text-white'
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className='text-[13px] text-white/55'>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Bar ── */}
          <div className='flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-6 sm:flex-row'>
            <p className='text-[12px] text-white/25'>
              &copy; {new Date().getFullYear()} {customerMode ? 'শপ বিডি' : 'শপ বিডি রিসেলার জবস'} —
              সকল স্বত্ব সংরক্ষিত
            </p>
            <div className='flex items-center gap-3'>
              <span className='flex items-center gap-1.5'>
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400' />
                <span className='text-[11px] text-white/20'>সার্ভার সক্রিয়</span>
              </span>
              <span className='h-3 w-px bg-white/10' />
              <p className='text-[11px] text-white/20'>
                ডিজাইন ও ডেভেলপমেন্ট —{' '}
                <span className='text-white/35'>
                  {customerMode ? 'শপ বিডি টিম' : 'শপ বিডি রিসেলার জবস টিম'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Scroll to top ── */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.93 }}
          onClick={scrollToTop}
          aria-label='উপরে যান'
          className='fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e94560] text-white shadow-[0_4px_20px_rgba(233,69,96,0.4)] transition hover:bg-[#c73652]'
        >
          <FaArrowUp className='h-4 w-4' />
        </motion.button>
      )}
    </>
  )
}

export default Footer
