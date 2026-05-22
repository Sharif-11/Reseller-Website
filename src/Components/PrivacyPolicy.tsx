// PrivacyPolicy.tsx — Redesigned to match BazaarHub design system
import {
  ChevronDown,
  Clock,
  Database,
  FileText,
  Globe,
  Link,
  Lock,
  Mail,
  Share2,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null)

  const sections = [
    {
      title: '১. আমরা যে ধরনের তথ্য সংগ্রহ করি',
      content:
        'আমরা কোনো ব্যক্তিগত বা সংবেদনশীল ব্যবহারকারীর তথ্য সংগ্রহ, প্রবেশ বা শেয়ার করি না, যদি না এখানে স্পষ্টভাবে উল্লেখ করা হয়।',
      icon: <FileText className='w-4 h-4' />,
    },
    {
      title: '২. আপনার তথ্য ব্যবহারের পদ্ধতি',
      content:
        'বর্তমানে আমাদের অ্যাপ্লিকেশনটি কোনো ব্যক্তিগত বা সংবেদনশীল তথ্য সংগ্রহ করে না। ভবিষ্যতে পরিবর্তন হলে পরিষ্কার সম্মতি প্রক্রিয়া চালু করা হবে।',
      icon: <Database className='w-4 h-4' />,
    },
    {
      title: '৩. তথ্য শেয়ারিং',
      content: 'আমরা অন্য কোনো তৃতীয় পক্ষের সাথে ব্যবহারকারীর তথ্য শেয়ার করি না।',
      icon: <Share2 className='w-4 h-4' />,
    },
    {
      title: '৪. তথ্য সুরক্ষা',
      content:
        'আধুনিক মানসম্মত সুরক্ষা ব্যবস্থা বাস্তবায়নের মাধ্যমে আপনার তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ।',
      icon: <Lock className='w-4 h-4' />,
    },
    {
      title: '৫. তথ্য সংরক্ষণ এবং অপসারণ',
      content:
        'বর্তমানে কোনো ব্যক্তিগত তথ্য সংগ্রহ করা হয় না, তাই কোনো সংরক্ষণ নীতি প্রযোজ্য নয়।',
      icon: <Database className='w-4 h-4' />,
    },
    {
      title: '৬. তৃতীয় পক্ষের সেবাসমূহ',
      content:
        'আমাদের অ্যাপে বাহ্যিক লিংক থাকতে পারে। তৃতীয় পক্ষের গোপনীয়তা নীতিমালার জন্য আমরা দায়বদ্ধ নই।',
      icon: <Link className='w-4 h-4' />,
    },
    {
      title: '৭. নীতিমালার পরিবর্তন',
      content: 'গুরুত্বপূর্ণ পরিবর্তনগুলো অ্যাপ্লিকেশন বা ইমেইলের মাধ্যমে জানানো হবে।',
      icon: <Clock className='w-4 h-4' />,
    },
    {
      title: '৮. যোগাযোগের ঠিকানা',
      content: 'support@shopbdresellerjob.com | www.shopbdresellerjobs.shop',
      icon: <Mail className='w-4 h-4' />,
    },
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3]' id='privacy'>
      <Helmet>
        <title>গোপনীয়তা নীতিমালা | BazaarHub</title>
      </Helmet>

      {/* Hero */}
      <div className='relative overflow-hidden bg-[#1a1a2e] pt-16'>
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className='mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-1.5'>
            <Shield className='h-3.5 w-3.5 text-[#e94560]' />
            <span className='text-[11px] font-semibold uppercase tracking-[0.8px] text-[#e94560]'>
              গোপনীয়তা নীতিমালা
            </span>
          </div>
          <h1 className='font-serif text-[clamp(26px,4vw,44px)] font-bold text-white mb-3'>
            আপনার তথ্যের সুরক্ষা
          </h1>
          <p className='text-white/40 text-[14px] max-w-md mx-auto'>কার্যকর তারিখ: ০১ জুন ২০২৫</p>
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Intro card */}
        <div className='mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          <p className='text-[14px] leading-[1.8] text-gray-600'>
            শপ বিডি রিসেলার জবস আমাদের ব্যবহারকারীদের তথ্যের গোপনীয়তা রক্ষায় সর্বদা অঙ্গীকারবদ্ধ।
            এই নীতিমালায় বিস্তারিতভাবে বর্ণনা করা হয়েছে কিভাবে আমরা আপনার তথ্য সংগ্রহ করি এবং
            সুরক্ষিত রাখি।
          </p>
        </div>

        {/* Accordion */}
        <div className='space-y-2'>
          {sections.map((section, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${activeSection === index ? 'border-[#e94560]/20 shadow-[0_4px_20px_rgba(233,69,96,0.08)]' : 'border-gray-100 bg-white'}`}
            >
              <button
                className='flex w-full items-center justify-between px-5 py-4 text-left'
                onClick={() => setActiveSection(activeSection === index ? null : index)}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${activeSection === index ? 'bg-[#e94560] text-white' : 'bg-[#f7f6f3] text-gray-400'}`}
                  >
                    {section.icon}
                  </div>
                  <span
                    className={`text-[14px] font-semibold ${activeSection === index ? 'text-[#1a1a2e]' : 'text-gray-700'}`}
                  >
                    {section.title}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${activeSection === index ? 'rotate-180 text-[#e94560]' : ''}`}
                />
              </button>
              {activeSection === index && (
                <div className='border-t border-gray-50 bg-[#f7f6f3]/50 px-5 py-4'>
                  <p className='text-[13px] leading-[1.75] text-gray-600'>{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className='mt-8 rounded-2xl bg-[#1a1a2e] p-6'>
          <div className='absolute' />
          <div className='relative'>
            <p className='mb-1 text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
              যোগাযোগ
            </p>
            <h3 className='mb-3 font-serif text-[18px] font-bold text-white'>প্রশ্ন আছে?</h3>
            <div className='flex flex-col gap-2'>
              <a
                href='mailto:support@shopbdresellerjob.com'
                className='flex items-center gap-2.5 text-[13px] text-white/60 hover:text-white transition'
              >
                <Mail className='h-4 w-4 text-[#e94560]' /> support@shopbdresellerjob.com
              </a>
              <a
                href='https://www.shopbdresellerjobs.shop'
                className='flex items-center gap-2.5 text-[13px] text-white/60 hover:text-white transition'
              >
                <Globe className='h-4 w-4 text-[#e94560]' /> www.shopbdresellerjobs.shop
              </a>
            </div>
          </div>
        </div>

        <p className='mt-8 text-center text-[12px] text-gray-400'>
          © {new Date().getFullYear()} BazaarHub — সকল স্বত্ব সংরক্ষিত।
        </p>
      </div>
    </div>
  )
}

export default PrivacyPolicy
