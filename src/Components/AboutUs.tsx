// AboutUs.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
import { cubicBezier, motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { BiTransferAlt } from 'react-icons/bi'
import { BsCashCoin, BsTicketDetailed } from 'react-icons/bs'
import {
  FaArrowRight,
  FaCheckCircle,
  FaGem,
  FaRegSmile,
  FaRocket,
  FaShieldAlt,
  FaUserPlus,
} from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import { MdGroup, MdOutlineEmojiEvents, MdPayment, MdSecurity, MdWeb } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: cubicBezier(0.22, 1, 0.36, 1) },
})

/* ─── Data ─── */
const STATS = [
  { value: '১০,০০০+', label: 'সক্রিয় রিসেলার', icon: MdGroup },
  { value: '৫০০+', label: 'মাসিক অর্ডার', icon: BsCashCoin },
  { value: '৯৯%', label: 'সন্তুষ্টি হার', icon: FaRegSmile },
  { value: '২৪/৭', label: 'সাপোর্ট সেবা', icon: BsTicketDetailed },
]

const FEATURES = [
  {
    icon: FaShieldAlt,
    title: 'কাস্টমার ফ্রড চেকার',
    desc: 'আপনার ব্যবসাকে ফ্রড থেকে সুরক্ষিত রাখুন',
    tag: 'ফ্রি',
  },
  {
    icon: FaUserPlus,
    title: 'সেলার রেফার',
    desc: 'অন্যান্য রিসেলারদের রেফার করে ইনকাম করুন',
    tag: 'আনলিমিটেড',
  },
  {
    icon: FaUserPlus,
    title: 'কাস্টমার রেফার',
    desc: 'কাস্টমার রেফার করে অতিরিক্ত আয় করুন',
    tag: 'প্যাসিভ',
  },
  {
    icon: MdWeb,
    title: 'ল্যান্ডিং পেজ ফ্রী',
    desc: 'প্রতিটি পণ্যের জন্য বিনামূল্যে ল্যান্ডিং পেজ',
    tag: 'লাইফটাইম',
  },
  {
    icon: MdGroup,
    title: 'টিম ব্যবস্থাপনা',
    desc: 'আপনার টিম তৈরি করে প্যাসিভ ইনকাম করুন',
    tag: '২ লেভেল',
  },
]

const BENEFITS = [
  {
    icon: MdWeb,
    title: 'বিনামূল্যে ল্যান্ডিং পেজ',
    desc: 'প্রতিটি পণ্যের জন্য আলাদা ল্যান্ডিং পেজ তৈরি করতে পারবেন এবং তা দিয়ে বুস্ট বা মার্কেটিং করতে পারবেন। আপনি আপনার ইচ্ছেমতো পণ্যের দাম নির্ধারণ করতে পারবেন।',
  },
  {
    icon: FaShieldAlt,
    title: 'ফ্রড চেকার',
    desc: 'আপনার ব্যবসা নিরাপদ রাখতে আছে কাস্টমার ফ্রড চেকার।',
  },
  {
    icon: FaUserPlus,
    title: 'রেফার করে ইনকাম',
    desc: 'আপনি আপনার বন্ধুদের রিসেলার বা কাস্টমার হিসেবে রেফার করতে পারেন এবং প্রতি অর্ডারে ইনকাম করতে পারবেন।',
  },
  {
    icon: MdGroup,
    title: 'টিম তৈরি করে প্যাসিভ ইনকাম',
    desc: 'আপনার অধীনে একটি রিসেলার টিম তৈরি করে দুই লেভেল পর্যন্ত প্যাসিভ ইনকাম করার সুযোগ পাবেন।',
  },
  {
    icon: BsCashCoin,
    title: 'ক্যাশ অন ডেলিভারি',
    desc: 'গ্রাহকদের কাছ থেকে ডেলিভারি চার্জ অগ্রিম নেওয়ার প্রয়োজন নেই। একাধিক পণ্য অর্ডারের জন্য একটি মাত্র ডেলিভারি চার্জ প্রযোজ্য।',
  },
  {
    icon: BiTransferAlt,
    title: 'দ্রুত পেমেন্ট',
    desc: 'মাত্র ৫০ টাকা হলেই বিকাশ বা নগদের মাধ্যমে টাকা তুলতে পারবেন। পেমেন্ট উইথড্র করার সর্বোচ্চ ২৪ ঘন্টার মধ্যে উইথড্র কৃত টাকা পেয়ে যাবেন।',
  },
  {
    icon: BsTicketDetailed,
    title: 'সাপোর্ট সিস্টেম',
    desc: 'যেকোনো প্রয়োজনে সাপোর্ট সেন্টার, সাপোর্ট টিকেট এবং হটলাইন নাম্বারের সুবিধা পাবেন।',
  },
]

const REQUIREMENTS = [
  {
    icon: FaRegSmile,
    title: 'রেজিস্ট্রেশন',
    desc: 'রেজিস্ট্রেশন করতে কোনো ইনভেস্টমেন্টের প্রয়োজন নেই, সম্পূর্ণ বিনামূল্যে।',
  },
  {
    icon: GiProgression,
    title: 'ভেরিফিকেশন',
    desc: 'রেফারেল ইনকাম পেতে হলে প্রথমে আপনাকে একটি অর্ডার দিয়ে আপনার অ্যাকাউন্ট ভেরিফাই করতে হবে।',
  },
  {
    icon: MdPayment,
    title: 'ডেলিভারি চার্জ',
    desc: 'কাস্টমার রেফার বা ল্যান্ডিং পেজ এর মাধ্যমে কাস্টমার অর্ডার সাবমিট করতে অফিস নাম্বারে ডেলিভারি চার্জ অগ্রিম প্রদান আবশ্যক করে দেওয়া হয়েছে তাই রিটার্ন হওয়ার কোন ঝামেলা নেই।',
  },
]

/* ─── Section header ─── */
const SectionHeader = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  delay = 0,
}: {
  badge: string
  badgeIcon: React.ElementType
  title: string
  subtitle?: string
  delay?: number
}) => (
  <div className='mb-10 text-center'>
    <motion.div
      {...fadeUp(delay)}
      className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5'
    >
      <BadgeIcon className='h-3 w-3 text-[#e94560]' />
      <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
        {badge}
      </span>
    </motion.div>
    <motion.h2
      {...fadeUp(delay + 0.07)}
      className='mb-3 font-serif text-[clamp(22px,3vw,36px)] font-bold tracking-tight text-[#1a1a2e]'
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        {...fadeUp(delay + 0.13)}
        className='mx-auto max-w-md text-[14px] leading-[1.7] text-gray-500'
      >
        {subtitle}
      </motion.p>
    )}
  </div>
)

/* ════════════════════════════════════════════ */
const AboutUs = () => {
  const navigate = useNavigate()
  const benefitsRef = useRef<HTMLDivElement>(null)
  const benefitsInView = useInView(benefitsRef, { once: true, margin: '-60px' })

  return (
    <div className='overflow-hidden bg-[#f7f6f3]'>
      {/* ══ HERO ══ */}
      <section className='relative overflow-hidden bg-[#1a1a2e]'>
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className='pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full border border-white/[0.04]' />
        <div className='pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full border border-[#e94560]/[0.06]' />

        <div className='relative z-10 mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24'>
          <div className='mx-auto max-w-2xl text-center'>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='mb-4 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-1.5'
            >
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[#e94560]' />
              <span className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[#e94560]'>
                বাংলাদেশের সেরা রিসেলিং প্ল্যাটফর্ম
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className='mb-4 font-serif text-[clamp(30px,5vw,56px)] font-bold leading-[1.07] tracking-tight text-white'
            >
              শপ বিডি রিসেলার জবস
              <br />
              <em className='font-serif text-[0.6em] font-medium not-italic text-white/35'>
                বিনিয়োগ ছাড়াই নিজের ব্যবসা শুরু করুন
              </em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className='mb-8 text-[15px] leading-[1.75] text-white/45'
            >
              শপবিডি রিসেলার প্রোগ্রামে যুক্ত হয়ে সহজেই একটি অনলাইন ব্যবসা শুরু করুন। এখানে আছে
              দারুণ কিছু সুবিধা, যা আপনার কাজকে আরও সহজ করবে।
            </motion.p>

            {/* Stat row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className='grid grid-cols-2 gap-3 sm:grid-cols-4'
            >
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className='rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 text-center transition hover:border-white/12 hover:bg-white/[0.07]'
                >
                  <div className='mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e94560]/15 mx-auto'>
                    <s.icon className='h-4 w-4 text-[#e94560]' />
                  </div>
                  <p className='font-serif text-[22px] font-bold text-white'>{s.value}</p>
                  <p className='mt-0.5 text-[10px] text-white/35'>{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className='px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <SectionHeader
            badge='দুর্দান্ত ফিচারসমূহ'
            badgeIcon={FaRocket}
            title='আকর্ষণীয় ফিচারসমূহ'
            subtitle='আপনার ব্যবসাকে এগিয়ে নিতে প্রয়োজনীয় সকল সুবিধা'
          />

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-transparent hover:shadow-[0_12px_40px_rgba(26,26,46,0.1)]'
              >
                {/* Hover top accent */}
                <div className='absolute left-0 right-0 top-0 h-[3px] bg-[#e94560] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e94560]/8'>
                  <feat.icon className='h-5 w-5 text-[#e94560]' />
                </div>
                <h3 className='mb-1.5 font-serif text-[15px] font-bold text-[#1a1a2e]'>
                  {feat.title}
                </h3>
                <p className='mb-4 text-[12px] leading-[1.6] text-gray-500'>{feat.desc}</p>
                <span className='inline-flex items-center rounded-full bg-[#1a1a2e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.4px] text-white'>
                  {feat.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section className='bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <SectionHeader
            badge='মূল সুবিধাসমূহ'
            badgeIcon={FaCheckCircle}
            title='যা যা পাচ্ছেন আমাদের সাথে'
            subtitle='শুধুমাত্র আমাদের প্ল্যাটফর্মে পাওয়া যায় এমন একচেটিয়া সুবিধাসমূহ'
          />

          <div ref={benefitsRef} className='grid gap-3 sm:grid-cols-2'>
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.07, duration: 0.5, ease: cubicBezier(0.22, 1, 0.36, 1) }}
                className='group flex items-start gap-4 rounded-2xl border border-gray-100 p-5 transition-all duration-300 hover:border-[#e94560]/20 hover:bg-[#e94560]/[0.02] hover:shadow-[0_4px_20px_rgba(233,69,96,0.06)]'
              >
                <div className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]/5 transition duration-300 group-hover:bg-[#e94560]/10'>
                  <b.icon className='h-4 w-4 text-[#1a1a2e]/40 transition group-hover:text-[#e94560]' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='mb-1 font-serif text-[15px] font-bold text-[#1a1a2e]'>
                    {b.title}
                  </h3>
                  <p className='text-[13px] leading-[1.65] text-gray-500'>{b.desc}</p>
                </div>
                <FaCheckCircle className='mt-1 h-4 w-4 shrink-0 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100' />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REQUIREMENTS ══ */}
      <section className='px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <SectionHeader
            badge='প্রয়োজনীয় শর্তাবলী'
            badgeIcon={MdSecurity}
            title='শুরু করার আগে জানুন'
          />

          <div className='grid gap-4 md:grid-cols-3'>
            {REQUIREMENTS.map((r, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                whileHover={{ y: -4 }}
                className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,26,46,0.1)]'
              >
                {/* Step number watermark */}
                <span className='pointer-events-none absolute right-4 top-2 font-serif text-[64px] font-bold leading-none text-[#1a1a2e]/[0.04]'>
                  {['০১', '০২', '০৩'][i]}
                </span>
                <div className='absolute bottom-0 left-0 right-0 h-[3px] bg-[#e94560] opacity-0 transition-opacity group-hover:opacity-100' />

                <div className='mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#1a1a2e] px-2.5 py-1'>
                  <span className='text-[9px] font-bold uppercase tracking-[0.4px] text-white/50'>
                    ধাপ
                  </span>
                  <span className='text-[11px] font-bold text-white'>{['০১', '০২', '০৩'][i]}</span>
                </div>

                <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e94560]/8'>
                  <r.icon className='h-5 w-5 text-[#e94560]' />
                </div>
                <h3 className='mb-2 font-serif text-[16px] font-bold text-[#1a1a2e]'>{r.title}</h3>
                <p className='text-[13px] leading-[1.65] text-gray-500'>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className='px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8'>
        <div className='mx-auto max-w-screen-xl'>
          <motion.div
            {...fadeUp(0)}
            className='relative overflow-hidden rounded-3xl bg-[#1a1a2e] px-8 py-14 text-center sm:px-12 sm:py-16'
          >
            <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
            <div className='pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e94560]/[0.06]' />
            <div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/[0.02]' />
            <div
              className='pointer-events-none absolute inset-0'
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className='relative z-10'>
              <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e94560]/15'>
                <MdOutlineEmojiEvents className='h-7 w-7 text-[#e94560]' />
              </div>

              <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-3.5 py-1.5'>
                <FaGem className='h-3 w-3 text-[#e94560]' />
                <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                  আজই শুরু করুন
                </span>
              </div>

              <h2 className='mb-3 font-serif text-[clamp(22px,3vw,40px)] font-bold leading-tight text-white'>
                আজই শুরু করুন এবং প্রতিদিন
                <br />
                আনলিমিটেড আয় করার সুযোগ নিন
              </h2>
              <p className='mx-auto mb-8 max-w-md text-[14px] leading-[1.7] text-white/40'>
                শপ বিডি রিসেলার প্রোগ্রামে যোগ দিন এবং আপনার আর্থিক স্বাধীনতার পথ শুরু করুন
              </p>

              <motion.button
                onClick={() => navigate('/register#register')}
                whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(233,69,96,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className='inline-flex items-center gap-2.5 rounded-xl bg-[#e94560] px-8 py-3.5 text-[14px] font-semibold text-white transition'
              >
                প্রোগ্রামে যোগ দিন
                <FaArrowRight className='h-3.5 w-3.5' />
              </motion.button>

              <p className='mt-4 text-[11px] text-white/25'>
                বিনামূল্যে রেজিস্ট্রেশন &nbsp;•&nbsp; কোনো ক্রেডিট কার্ড নেই &nbsp;•&nbsp; তাৎক্ষণিক
                শুরু
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs
