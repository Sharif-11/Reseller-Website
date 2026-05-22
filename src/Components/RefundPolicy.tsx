// RefundPolicy.tsx — Redesigned to match BazaarHub design system
import { AlertCircle, CheckCircle, Mail, Phone, RotateCcw, Shield, Video } from 'lucide-react'
import { Helmet } from 'react-helmet'

const POLICY_CARDS = [
  {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    accent: 'border-l-emerald-400',
    title: 'ডেলিভারি সময় পণ্য পরীক্ষা',
    body: 'ডেলিভারি কর্মীর উপস্থিতিতে পণ্য অবশ্যই পরীক্ষা করে নিন। ত্রুটিপূর্ণ পণ্য পেলে সাথে সাথে ফেরত দিন। আমরা ২৪ ঘন্টার মধ্যে নতুনটি পাঠাব অথবা টাকা ফেরত দেব।',
  },
  {
    icon: RotateCcw,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
    accent: 'border-l-violet-400',
    title: 'ত্রুটির ধরন অনুযায়ী রিফান্ড',
    body: 'পণ্যে প্রকৃত ত্রুটি থাকলে সম্পূর্ণ টাকা ফেরত। ত্রুটি না থাকলে শুধু ডেলিভারি চার্জ কেটে বাকি টাকা ফেরত দেওয়া হবে।',
  },
  {
    icon: Video,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    accent: 'border-l-rose-400',
    title: 'ভিডিও প্রমাণ জমা দেওয়া',
    body: 'ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে আনবক্সিং ভিডিও পাঠান। ভিডিওতে পণ্যের আইডি এবং ত্রুটি স্পষ্টভাবে দেখা যেতে হবে।',
  },
  {
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    accent: 'border-l-amber-400',
    title: 'পরবর্তীতে রিটার্ন',
    body: 'ডেলিভারি কর্মী চলে যাওয়ার পর রিটার্ন করতে চাইলে ডেলিভারি চার্জসহ পণ্য ফেরত দিতে হবে। ব্যবহৃত বা ধোয়া পণ্য গ্রহণযোগ্য নয়।',
  },
]

const REFUND_ITEMS = [
  'রিটার্ন অনুমোদনের ২৪ ঘন্টার মধ্যে টাকা ফেরত',
  'যে অ্যাকাউন্ট থেকে পেমেন্ট, সেই অ্যাকাউন্টেই রিফান্ড',
  'ভিন্ন অ্যাকাউন্টে রিফান্ড গ্রহণযোগ্য নয়',
  '২৪ ঘন্টার মধ্যে টাকা না পেলে আমাদের সাথে যোগাযোগ করুন',
]

const RefundPolicy = () => (
  <div className='min-h-screen bg-[#f7f6f3]' id='refund'>
    <Helmet>
      <title>রিটার্ন পলিসি | BazaarHub</title>
    </Helmet>

    {/* Hero */}
    <div className='relative overflow-hidden bg-[#1a1a2e] pt-16'>
      <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className='mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8 text-center'>
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-1.5'>
          <Shield className='h-3.5 w-3.5 text-[#e94560]' />
          <span className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[#e94560]'>
            রিটার্ন ও রিফান্ড
          </span>
        </div>
        <h1 className='font-serif text-[clamp(26px,4vw,44px)] font-bold text-white mb-3'>
          পণ্য রিটার্ন নীতিমালা
        </h1>
        <p className='text-white/40 text-[14px] max-w-sm mx-auto'>
          কাস্টমার সন্তুষ্টিই আমাদের সর্বোচ্চ অগ্রাধিকার
        </p>
      </div>
    </div>

    <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
      {/* Alert */}
      <div className='mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4'>
        <AlertCircle className='h-5 w-5 shrink-0 text-amber-500 mt-0.5' />
        <p className='text-[13px] leading-[1.75] text-amber-900'>
          পণ্য গ্রহণের সময় অবশ্যই আমাদের ডেলিভারি এজেন্টের উপস্থিতিতে পণ্য পরীক্ষা করে নিন।
        </p>
      </div>

      {/* Return policy cards */}
      <h2 className='mb-4 font-serif text-[20px] font-bold text-[#1a1a2e]'>
        পণ্য রিটার্ন নীতিমালা
      </h2>
      <div className='mb-10 grid gap-3 sm:grid-cols-2'>
        {POLICY_CARDS.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-gray-100 bg-white p-5 border-l-4 ${card.accent}`}
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <h3 className='mb-2 text-[14px] font-semibold text-[#1a1a2e]'>{card.title}</h3>
            <p className='text-[13px] leading-[1.7] text-gray-500'>{card.body}</p>
          </div>
        ))}
      </div>

      {/* Refund policy */}
      <h2 className='mb-4 font-serif text-[20px] font-bold text-[#1a1a2e]'>টাকা ফেরত নীতিমালা</h2>
      <div className='mb-10 rounded-2xl border border-gray-100 bg-white p-6'>
        <div className='space-y-3'>
          {REFUND_ITEMS.map((item, i) => (
            <div key={i} className='flex items-start gap-3'>
              <div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100'>
                <CheckCircle className='h-3 w-3 text-emerald-600' />
              </div>
              <p className='text-[13px] leading-[1.7] text-gray-600'>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className='rounded-2xl bg-[#1a1a2e] p-6'>
        <p className='mb-1 text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
          সহযোগিতা প্রয়োজন?
        </p>
        <h3 className='mb-4 font-serif text-[18px] font-bold text-white'>
          আমাদের সাথে যোগাযোগ করুন
        </h3>
        <div className='grid gap-3 sm:grid-cols-2'>
          <a
            href='tel:09638755704'
            className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition hover:bg-white/10 hover:text-white'
          >
            <Phone className='h-4 w-4 text-[#e94560] shrink-0' />
            <div>
              <p className='text-[10px] text-white/30 uppercase tracking-wider'>কল করুন</p>
              <p className='text-[13px] font-medium'>09638755704</p>
            </div>
          </a>
          <a
            href='mailto:support@shopbdresellerjob.com'
            className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition hover:bg-white/10 hover:text-white'
          >
            <Mail className='h-4 w-4 text-[#e94560] shrink-0' />
            <div>
              <p className='text-[10px] text-white/30 uppercase tracking-wider'>ইমেইল</p>
              <p className='text-[13px] font-medium'>support@shopbdresellerjob.com</p>
            </div>
          </a>
        </div>
        <p className='mt-4 text-[11px] text-white/25'>
          সকাল ৯টা — রাত ১০টা • ইমেইল জবাব ২৪ ঘন্টার মধ্যে
        </p>
      </div>

      <p className='mt-8 text-center text-[12px] text-gray-400'>
        © {new Date().getFullYear()} BazaarHub — সকল স্বত্ব সংরক্ষিত।
      </p>
    </div>
  </div>
)

export default RefundPolicy
