// CustomerIntroduction.tsx — Redesigned to match BazaarHub design system
// Design tokens: --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3
import { easeInOut, motion } from 'framer-motion'
import {
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaQrcode,
  FaShoppingCart,
  FaUserPlus,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: easeInOut },
})

const fadeUpInView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: easeInOut },
})

const STEPS = [
  {
    num: '০১',
    icon: FaUserPlus,
    title: 'রেজিস্ট্রেশন করুন',
    desc: 'ফোন নম্বর ও OTP ভেরিফিকেশনের মাধ্যমে কয়েক মিনিটে অ্যাকাউন্ট তৈরি করুন।',
    accent: 'rgba(99,102,241,0.12)',
    iconColor: 'text-indigo-400',
  },
  {
    num: '০২',
    icon: FaQrcode,
    title: 'রেফারেল লিংক ব্যবহার করুন',
    desc: 'আপনাকে প্রদত্ত লিংক বা QR কোড স্ক্যান করে শপিং শুরু করুন।',
    accent: 'rgba(16,185,129,0.12)',
    iconColor: 'text-emerald-400',
  },
  {
    num: '০৩',
    icon: FaShoppingCart,
    title: 'অর্ডার সম্পন্ন করুন',
    desc: 'পণ্য নির্বাচন করে সহজেই আপনার অর্ডার সম্পন্ন করুন।',
    accent: 'rgba(233,69,96,0.12)',
    iconColor: 'text-rose-400',
  },
  {
    num: '০৪',
    icon: FaClipboardList,
    title: 'অর্ডার ট্র্যাক করুন',
    desc: 'যেকোনো সময় লগইন করে আপনার অর্ডারের সর্বশেষ অবস্থা দেখুন।',
    accent: 'rgba(245,166,35,0.12)',
    iconColor: 'text-amber-400',
  },
]

const TRUST_ITEMS = [
  'অ্যাকাউন্ট রেজিস্ট্রেশন আবশ্যক',
  'একটি নম্বর = একটি অ্যাকাউন্ট',
  'তাৎক্ষণিক ভেরিফিকেশন',
]

const CustomerIntroduction = () => {
  const navigate = useNavigate()

  return (
    <div className='bg-[#f7f6f3]'>
      {/* ════ HERO ════ */}
      <section className='relative overflow-hidden bg-[#16213e]'>
        {/* Background texture */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className='pointer-events-none absolute -right-36 -top-48 h-[560px] w-[560px] rounded-full border border-white/[0.04]' />
        <div className='pointer-events-none absolute -bottom-36 -left-24 h-[400px] w-[400px] rounded-full border border-[#e94560]/[0.06]' />
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent' />

        <div className='relative z-10 mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24'>
          <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
            {/* Left: Copy */}
            <div>
              <motion.div
                {...fadeUp(0)}
                className='mb-6 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-1.5'
              >
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#e94560]' />
                <span className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[#e94560]'>
                  শপ বিডি — সহজ শপিং অভিজ্ঞতা
                </span>
              </motion.div>

              <motion.h1
                {...fadeUp(0.08)}
                className='mb-5 font-serif text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.08] tracking-tight text-white'
              >
                রেজিস্ট্রেশন করে
                <br />
                <span className='relative inline-block'>
                  শপিং শুরু করুন
                  <span className='absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-[#e94560]' />
                </span>
                <br />
                <em className='font-serif font-medium not-italic text-white/40'>আজই, এখনই</em>
              </motion.h1>

              <motion.p
                {...fadeUp(0.16)}
                className='mb-8 max-w-md text-[15px] leading-[1.75] text-white/50'
              >
                সহজ রেজিস্ট্রেশন প্রক্রিয়া শেষ করে আমাদের প্রিমিয়াম পণ্যের বিশাল সংগ্রহ থেকে
                যেকোনো পণ্য অর্ডার করুন। দ্রুত ডেলিভারি নিশ্চিত।
              </motion.p>

              <motion.div {...fadeUp(0.22)} className='mb-8 flex flex-wrap gap-3'>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(233,69,96,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register#register')}
                  className='flex items-center gap-2 rounded-xl bg-[#e94560] px-7 py-3.5 text-[14px] font-semibold text-white transition'
                >
                  ফ্রি রেজিস্ট্রেশন করুন
                  <FaArrowRight className='h-3.5 w-3.5' />
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/products#products')}
                  className='flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-7 py-3.5 text-[14px] font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-white'
                >
                  পণ্য দেখুন
                </motion.button>
              </motion.div>

              <motion.div {...fadeUp(0.28)} className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} className='flex items-center gap-1.5 text-[12px] text-white/40'>
                    <FaCheckCircle className='h-3 w-3 text-emerald-400' />
                    {item}
                    {i < TRUST_ITEMS.length - 1 && <span className='ml-2 h-3 w-px bg-white/10' />}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Steps grid */}
            <div className='hidden flex-col gap-3 lg:flex'>
              <div className='grid grid-cols-2 gap-3'>
                {STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
                    whileHover={{ y: -3 }}
                    className='cursor-default rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.07]'
                  >
                    <div
                      className='mb-3 flex h-9 w-9 items-center justify-center rounded-xl'
                      style={{ background: step.accent }}
                    >
                      <step.icon className={`h-4 w-4 ${step.iconColor}`} />
                    </div>
                    <p className='mb-1 font-serif text-[15px] font-bold text-white'>{step.title}</p>
                    <p className='text-[11px] leading-[1.6] text-white/40'>{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ HOW TO REGISTER ════ */}
      <section
        className='relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8'
        id='how-to-order'
      >
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(26,26,46,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className='relative mx-auto max-w-screen-xl'>
          <div className='mb-12 text-center'>
            <motion.div
              {...fadeUpInView(0)}
              className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5'
            >
              <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                কাজের ধাপ
              </span>
            </motion.div>
            <motion.h2
              {...fadeUpInView(0.07)}
              className='mb-3 font-serif text-[clamp(22px,3vw,36px)] font-bold tracking-tight text-[#1a1a2e]'
            >
              রেজিস্ট্রেশন প্রক্রিয়া
            </motion.h2>
            <motion.p
              {...fadeUpInView(0.13)}
              className='mx-auto max-w-md text-[14px] leading-[1.7] text-gray-500'
            >
              মাত্র কয়েকটি সহজ ধাপে আপনার শপিং যাত্রা শুরু করুন
            </motion.p>
          </div>

          {/* Steps */}
          <div className='relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6'>
            <div className='pointer-events-none absolute left-[calc(25%+16px)] right-[calc(25%+16px)] top-[52px] hidden h-px bg-gradient-to-r from-[#e94560]/20 via-[#e94560]/40 to-[#e94560]/20 lg:block' />

            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_40px_rgba(26,26,46,0.1)]'
              >
                <span className='pointer-events-none absolute right-4 top-3 font-serif text-[64px] font-bold leading-none text-[#1a1a2e]/[0.04]'>
                  {step.num}
                </span>
                <div
                  className='mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl'
                  style={{ background: step.accent }}
                >
                  <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                </div>
                <div className='mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#1a1a2e] px-2.5 py-1'>
                  <span className='text-[9px] font-bold uppercase tracking-[0.5px] text-white/50'>
                    ধাপ
                  </span>
                  <span className='text-[11px] font-bold text-white'>{step.num}</span>
                </div>
                <h3 className='mb-2 font-serif text-[17px] font-bold text-[#1a1a2e]'>
                  {step.title}
                </h3>
                <p className='text-[13px] leading-[1.65] text-gray-500'>{step.desc}</p>
                <div className='absolute bottom-0 left-0 right-0 h-[3px] bg-[#e94560] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              </motion.div>
            ))}
          </div>

          {/* Registration details card */}
          <motion.div
            {...fadeUpInView(0.2)}
            className='mt-10 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8'
          >
            <h3 className='mb-4 border-b border-gray-100 pb-3 font-serif text-[18px] font-bold text-[#1a1a2e]'>
              বিস্তারিত নির্দেশনা
            </h3>
            <ol className='space-y-4 text-[14px] leading-[1.75] text-gray-600'>
              <li className='flex gap-3'>
                <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold text-white'>
                  ১
                </span>
                <span>
                  <strong className='font-semibold text-[#1a1a2e]'>ফোন নম্বর দিন:</strong> সচল ফোন
                  নম্বর লিখুন এবং "ওটিপি পাঠান" বাটনে ক্লিক করুন।
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold text-white'>
                  ২
                </span>
                <span>
                  <strong className='font-semibold text-[#1a1a2e]'>ওটিপি যাচাই করুন:</strong> SMS-এ
                  আসা OTP কোড নির্দিষ্ট স্থানে প্রবেশ করিয়ে "যাচাই করুন" বাটনে ক্লিক করুন।
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold text-white'>
                  ৩
                </span>
                <span>
                  <strong className='font-semibold text-[#1a1a2e]'>অ্যাকাউন্ট তৈরি:</strong> OTP
                  সঠিক হলে আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়ে যাবে।
                </span>
              </li>
            </ol>

            <div className='mt-6 rounded-xl border border-[#e94560]/15 bg-[#e94560]/5 p-4'>
              <p className='mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#e94560]'>
                গুরুত্বপূর্ণ তথ্য
              </p>
              <ul className='space-y-1.5 text-[13px] text-gray-600'>
                {[
                  'অর্ডার করার পূর্বে অ্যাকাউন্ট রেজিস্ট্রেশন আবশ্যক',
                  'রেজিস্ট্রেশন ছাড়া গ্রাহক হিসেবে বিবেচিত হবেন না',
                  'একটি ফোন নম্বর দিয়ে একটিমাত্র অ্যাকাউন্ট তৈরি করা যাবে',
                  'প্রশ্ন থাকলে আমাদের সেলস টিমকে জিজ্ঞাসা করুন',
                ].map((item, i) => (
                  <li key={i} className='flex items-start gap-2'>
                    <FaCheckCircle className='mt-0.5 h-3 w-3 shrink-0 text-[#e94560]' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fadeUpInView(0.3)} className='mt-10 text-center'>
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(233,69,96,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register#register')}
              className='inline-flex items-center gap-2 rounded-xl bg-[#e94560] px-8 py-3.5 text-[14px] font-semibold text-white transition'
            >
              এখনই রেজিস্ট্রেশন করুন
              <FaArrowRight className='h-3.5 w-3.5' />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ════ CTA BANNER ════ */}
      <div className='px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <motion.div
            {...fadeUpInView(0)}
            className='relative overflow-hidden rounded-3xl bg-[#1a1a2e] px-8 py-14 sm:px-12 sm:py-16'
          >
            <div className='pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e94560]/[0.07]' />
            <div className='pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-white/[0.02]' />
            <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent' />

            <div className='relative z-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center'>
              <div>
                <h2 className='mb-3 font-serif text-[clamp(20px,2.8vw,32px)] font-bold leading-tight text-white'>
                  আজই শপিং শুরু করুন
                </h2>
                <p className='max-w-md text-[14px] leading-[1.7] text-white/40'>
                  সহজ রেজিস্ট্রেশন প্রক্রিয়া শেষ করে প্রিমিয়াম পণ্যের বিশাল সংগ্রহ উপভোগ করুন।
                </p>
              </div>
              <div className='flex shrink-0 flex-col items-start gap-3 sm:items-end'>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(233,69,96,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/products#products')}
                  className='flex items-center gap-2 rounded-xl bg-[#e94560] px-8 py-3.5 text-[15px] font-semibold text-white transition'
                >
                  পণ্য দেখুন
                  <FaArrowRight className='h-4 w-4' />
                </motion.button>
                <p className='text-[11px] text-white/30'>দ্রুত ডেলিভারি&nbsp;•&nbsp;নিরাপদ শপিং</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CustomerIntroduction
