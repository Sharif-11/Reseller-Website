// HomeIntroduction.tsx — Redesigned to match BazaarHub design system
import { easeInOut, motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  FaArrowRight,
  FaChartLine,
  FaClock,
  FaGem,
  FaHeadset,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaStore,
  FaUsers,
  FaWallet,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

/* ─── Animation helpers ─── */
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

/* ─── Data ─── */
const STATS = [
  { value: '১,০০০+', label: 'সক্রিয় রিসেলার', icon: FaUsers, color: 'rgba(99,102,241,0.15)' },
  { value: '৫০০+', label: 'মাসিক অর্ডার', icon: FaChartLine, color: 'rgba(16,185,129,0.15)' },
  { value: '৯৯%', label: 'ক্লায়েন্ট সন্তুষ্টি', icon: FaStar, color: 'rgba(245,166,35,0.15)' },
  { value: '২৪/৭', label: 'সাপোর্ট সেবা', icon: FaHeadset, color: 'rgba(233,69,96,0.15)' },
]

const FEATURES = [
  {
    icon: FaStore,
    title: 'শূন্য বিনিয়োগ',
    desc: 'কোনো স্টক বা মূলধন ছাড়াই ব্যবসা শুরু করুন। পণ্য বিক্রি হলেই পেমেন্ট নিন।',
    accent: 'from-blue-500 to-cyan-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: FaRocket,
    title: 'দ্রুত পেমেন্ট',
    desc: 'প্রতিটি সফল অর্ডারের পর সরাসরি আপনার অ্যাকাউন্টে পেমেন্ট পান।',
    accent: 'from-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    icon: FaShieldAlt,
    title: 'গুণগত মান নিশ্চিত',
    desc: 'প্রতিটি পণ্য কঠোর মান নিয়ন্ত্রণ প্রক্রিয়ার মধ্য দিয়ে যায়। ১০০% টেস্টেড।',
    accent: 'from-[#e94560] to-orange-400',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    icon: FaClock,
    title: '২৪ ঘণ্টা ডেলিভারি',
    desc: 'বাংলাদেশের যেকোনো প্রান্তে দ্রুততম ডেলিভারি সার্ভিস নিশ্চিত করি।',
    accent: 'from-violet-500 to-indigo-400',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
]

/* ════════════════════════════════════════════
   Component
════════════════════════════════════════════ */
const HomeIntroduction = () => {
  const navigate = useNavigate()
  const featRef = useRef<HTMLDivElement>(null)
  const featInView = useInView(featRef, { once: true, margin: '-60px' })

  return (
    <div className='bg-[#f7f6f3] min-h-screen'>
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
        {/* Decorative circles */}
        <div className='pointer-events-none absolute -right-36 -top-48 h-[560px] w-[560px] rounded-full border border-white/[0.04]' />
        <div className='pointer-events-none absolute -bottom-36 -left-24 h-[400px] w-[400px] rounded-full border border-[#e94560]/[0.06]' />
        {/* Top accent */}
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent' />

        <div className='relative z-10 mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24'>
          <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <motion.div
                {...fadeUp(0)}
                className='mb-6 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-1.5'
              >
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#e94560]' />
                <span className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[#e94560]'>
                  বাংলাদেশের নির্ভরযোগ্য ড্রপশিপিং ও রিসেলিং প্ল্যাটফর্ম
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                {...fadeUp(0.08)}
                className='mb-5 font-serif text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.08] tracking-tight text-white'
              >
                বিনা বিনিয়োগে
                <br />
                <span className='relative inline-block'>
                  অনলাইন ব্যবসা
                  <span className='absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-[#e94560]' />
                </span>
                <br />
                <em className='font-serif font-medium not-italic text-white/40'>শুরু করুন আজই</em>
              </motion.h1>

              {/* Body */}
              <motion.p
                {...fadeUp(0.16)}
                className='mb-8 max-w-md text-[15px] leading-[1.75] text-white/50'
              >
                হাজারো সফল রিসেলারের বিশ্বস্ত প্ল্যাটফর্মে যোগ দিন। শূন্য বিনিয়োগে শুরু করুন,
                প্রিমিয়াম পণ্য বিক্রি করুন এবং প্রতিটি অর্ডারে তাৎক্ষণিক আয় করুন।
              </motion.p>

              {/* CTAs */}
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
                  onClick={() => navigate('/login')}
                  className='flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-7 py-3.5 text-[14px] font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-white'
                >
                  লগইন করুন
                </motion.button>
              </motion.div>

              {/* Trust items */}
              {/* <motion.div {...fadeUp(0.28)} className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} className='flex items-center gap-1.5 text-[12px] text-white/40'>
                    <FaCheckCircle className='h-3 w-3 text-emerald-400' />
                    {item}
                    {i < TRUST_ITEMS.length - 1 && <span className='ml-2 h-3 w-px bg-white/10' />}
                  </div>
                ))}
              </motion.div> */}
            </div>

            {/* Right: Stats grid */}
            <div className='hidden flex-col gap-3 lg:flex'>
              <div className='grid grid-cols-2 gap-3'>
                {STATS.map((stat, i) => (
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
                      style={{ background: stat.color }}
                    >
                      <stat.icon className='h-4 w-4 text-white/70' />
                    </div>
                    <p className='font-serif text-[26px] font-bold leading-none text-white'>
                      {stat.value}
                    </p>
                    <p className='mt-1.5 text-[11px] tracking-[0.3px] text-white/40'>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Feature highlight strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className='flex items-center gap-3 rounded-2xl border border-[#e94560]/15 bg-[#e94560]/8 p-4'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e94560]'>
                  <FaWallet className='h-4 w-4 text-white' />
                </div>
                <div>
                  <p className='text-[13px] font-semibold text-white'>
                    দ্রুততম ডেলিভারি গ্যারান্টি
                  </p>
                  <p className='text-[11px] text-white/40'>
                    অর্ডার প্রদানের ২৪ ঘণ্টার মধ্যে ডেলিভারি
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ ACHIEVEMENTS BAR ════ */}

      {/* ════ FEATURES ════ */}
      <section className='px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          {/* Section header */}
          <div className='mb-10'>
            <motion.div
              {...fadeUpInView(0)}
              className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5'
            >
              <FaGem className='h-3 w-3 text-[#e94560]' />
              <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                কেন আমাদের বেছে নেবেন
              </span>
            </motion.div>
            <motion.h2
              {...fadeUpInView(0.07)}
              className='mb-3 font-serif text-[clamp(22px,3vw,36px)] font-bold tracking-tight text-[#1a1a2e]'
            >
              সাফল্যের জন্য যা যা প্রয়োজন
            </motion.h2>
            <motion.p
              {...fadeUpInView(0.13)}
              className='max-w-lg text-[14px] leading-[1.7] text-gray-500'
            >
              আমরা আপনার সফল অনলাইন ব্যবসার জন্য প্রয়োজনীয় সব টুলস এবং সাপোর্ট প্রদান করি।
            </motion.p>
          </div>

          {/* Feature cards */}
          <div ref={featRef} className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={featInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className='group relative cursor-default overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)]'
              >
                {/* Top accent on hover */}
                <div
                  className={`absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r ${feat.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feat.iconBg}`}
                >
                  <feat.icon className={`h-5 w-5 ${feat.iconColor}`} />
                </div>
                <h3 className='mb-2 font-serif text-[16px] font-600 text-[#1a1a2e]'>
                  {feat.title}
                </h3>
                <p className='text-[13px] leading-[1.65] text-gray-500'>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <div className='px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <motion.div
            {...fadeUpInView(0)}
            className='relative overflow-hidden rounded-3xl bg-[#1a1a2e] px-8 py-14 sm:px-12 sm:py-16'
          >
            {/* Decorative blobs */}
            <div className='pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e94560]/[0.07]' />
            <div className='pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-white/[0.02]' />
            {/* Top accent */}
            <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent' />

            <div className='relative z-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center'>
              {/* Left text */}
              <div>
                <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-3 py-1'>
                  <FaRocket className='h-3 w-3 text-[#e94560]' />
                  <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                    আজই শুরু করুন
                  </span>
                </div>
                <h2 className='mb-3 font-serif text-[clamp(20px,2.8vw,32px)] font-bold leading-tight text-white'>
                  আপনার উদ্যোক্তা যাত্রা
                  <br />
                  এখানেই শুরু হোক
                </h2>
                <p className='max-w-md text-[14px] leading-[1.7] text-white/40'>
                  হাজার হাজার সফল রিসেলারের দলে যোগ দিন এবং প্রতি মাসে নিয়মিত আয় করুন।
                </p>
              </div>

              {/* Right CTA */}
              <div className='flex shrink-0 flex-col items-start gap-3 sm:items-end'>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(233,69,96,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register#register')}
                  className='flex items-center gap-2 rounded-xl bg-[#e94560] px-8 py-3.5 text-[15px] font-semibold text-white transition'
                >
                  এখনই রেজিস্ট্রেশন করুন
                  <FaArrowRight className='h-4 w-4' />
                </motion.button>
                <p className='text-[11px] text-white/30'>
                  কোনো হিডেন ফি নেই&nbsp;•&nbsp;১০০% নিরাপদ&nbsp;&nbsp;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HomeIntroduction
