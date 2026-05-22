// LandingPage.tsx — Fixed grouping & filtering
import { cubicBezier, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Package } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaArrowRight,
  FaBoxOpen,
  FaMoneyBillWave,
  FaRocket,
  FaSearch,
  FaShoppingBag,
  FaUserPlus,
} from 'react-icons/fa'
import { useNavigate } from 'react-router'
import shopApi from '../Api/shop.api'
import { useAuth } from '../Hooks/useAuth'
import HomeIntroduction from './CompanyIntro'
import CustomerIntroduction from './CustomerIntroduction'
import Footer from './Footer'

interface SubCategory {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number
  products: number
  sizeChart?: string
}

interface Category {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number | null
  subCategories?: SubCategory[]
  products: number
  priority?: number | null
}

/* ─── Scroll to top helper ─── */
const navigateWithScroll = (navigate: ReturnType<typeof useNavigate>, path: string) => {
  navigate(path)
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
}

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: cubicBezier(0.22, 1, 0.36, 1) },
})

/* ─── How it works data (unchanged) ─── */
const HOW_STEPS = [
  {
    num: '০১',
    icon: FaUserPlus,
    title: 'নিবন্ধন করুন',
    desc: 'মাত্র কয়েক মিনিটে ফ্রি অ্যাকাউন্ট তৈরি করুন এবং তাৎক্ষণিক ভেরিফিকেশন সম্পন্ন করুন।',
    accent: 'rgba(99,102,241,0.12)',
    iconColor: 'text-indigo-400',
  },
  {
    num: '০২',
    icon: FaBoxOpen,
    title: 'পণ্য নির্বাচন করুন',
    desc: 'হাজারো প্রিমিয়াম পণ্যের ক্যাটালগ ব্রাউজ করুন এবং আপনার পছন্দের পণ্যটি বেছে নিন।',
    accent: 'rgba(16,185,129,0.12)',
    iconColor: 'text-emerald-400',
  },
  {
    num: '০৩',
    icon: FaMoneyBillWave,
    title: 'আয় শুরু করুন',
    desc: 'সোশ্যাল মিডিয়ায় প্রচার করুন, অর্ডার নিন এবং প্রতিটি বিক্রয়ে তাৎক্ষণিক কমিশন পান।',
    accent: 'rgba(233,69,96,0.12)',
    iconColor: 'text-rose-400',
  },
]

/* ─── Trust badges ─── */
// const TRUST = [
//   { icon: FaCheckCircle, text: '১০০% ফ্রি রেজিস্ট্রেশন' },
//   { icon: FaChartLine, text: '২৪/৭ কাস্টমার সাপোর্ট' },
//   { icon: FaMoneyBillWave, text: 'তাৎক্ষণিক পেমেন্ট' },
// ]

/* ═══════════════════════════════════════ */
const LandingPage = () => {
  const { customerMode } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const catSectionRef = useRef<HTMLElement>(null)
  const catGridInView = useInView(catSectionRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({
    target: catSectionRef,
    offset: ['start end', 'end start'],
  })
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 1])

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCategories(true)
        const { success, data } = await shopApi.getCategories(null)
        if (success) setCategories(data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingCategories(false)
      }
    }
    if (categories.length === 0) load()
  }, [])

  // ── Filter subcategories based on search term (client‑side) ──
  // Returns a new array of categories, each with a filtered subCategories list.
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories

    const lowerTerm = searchTerm.toLowerCase()
    return categories
      .map(cat => ({
        ...cat,
        subCategories: cat.subCategories?.filter(sub => sub.name.toLowerCase().includes(lowerTerm)),
      }))
      .filter(cat => cat.subCategories && cat.subCategories.length > 0)
  }, [categories, searchTerm])

  const navigateToProducts = (categoryId: number) => {
    navigate('/products', { state: { categoryId } })
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }

  return (
    <div className='flex min-h-screen flex-col bg-[#f7f6f3]'>
      <main className='flex-grow'>
        {/* Hero */}
        {customerMode ? <CustomerIntroduction /> : <HomeIntroduction />}

        {/* HOW IT WORKS (seller mode only) - unchanged */}
        {!customerMode && (
          <section className='relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
            <div
              className='pointer-events-none absolute inset-0'
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(26,26,46,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className='relative mx-auto max-w-screen-xl'>
              <div className='mb-12 text-center'>
                <motion.div
                  {...fadeUp(0)}
                  className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5'
                >
                  <FaRocket className='h-3 w-3 text-[#e94560]' />
                  <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                    কাজের ধাপ
                  </span>
                </motion.div>
                <motion.h2
                  {...fadeUp(0.07)}
                  className='mb-3 font-serif text-[clamp(22px,3vw,36px)] font-bold tracking-tight text-[#1a1a2e]'
                >
                  কিভাবে কাজ করবেন?
                </motion.h2>
                <motion.p
                  {...fadeUp(0.13)}
                  className='mx-auto max-w-md text-[14px] leading-[1.7] text-gray-500'
                >
                  মাত্র ৩টি সহজ ধাপে শুরু করুন আপনার অনলাইন উদ্যোক্তা যাত্রা
                </motion.p>
              </div>

              <div className='relative grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6'>
                <div className='pointer-events-none absolute left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] top-[52px] hidden h-px bg-gradient-to-r from-[#e94560]/20 via-[#e94560]/40 to-[#e94560]/20 md:block' />
                {HOW_STEPS.map((step, i) => (
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

              <motion.div {...fadeUp(0.3)} className='mt-10 text-center'>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(233,69,96,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateWithScroll(navigate, '/register#register')}
                  className='inline-flex items-center gap-2 rounded-xl bg-[#e94560] px-8 py-3.5 text-[14px] font-semibold text-white transition'
                >
                  এখনই শুরু করুন
                  <FaArrowRight className='h-3.5 w-3.5' />
                </motion.button>
              </motion.div>
            </div>
          </section>
        )}

        {/* ══ CATEGORIES SECTION (grouped by parent category) ══ */}
        <section
          ref={catSectionRef}
          className='relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8'
        >
          <motion.div
            style={{ opacity: bgOpacity }}
            className='pointer-events-none absolute inset-0'
          >
            <div className='absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#e94560]/[0.04]' />
            <div className='absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#1a1a2e]/[0.03]' />
          </motion.div>

          <div className='relative mx-auto max-w-screen-xl'>
            <div className='mb-10'>
              <motion.div
                {...fadeUp(0)}
                className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#e94560]/15 bg-[#e94560]/8 px-3.5 py-1.5'
              >
                <FaShoppingBag className='h-3 w-3 text-[#e94560]' />
                <span className='text-[11px] font-semibold uppercase tracking-[0.6px] text-[#e94560]'>
                  পণ্যের ধরণ
                </span>
              </motion.div>
              <motion.h2
                {...fadeUp(0.07)}
                className='mb-3 font-serif text-[clamp(22px,3vw,36px)] font-bold tracking-tight text-[#1a1a2e]'
              >
                ক্যাটাগরি ব্রাউজ করুন
              </motion.h2>
              <motion.p
                {...fadeUp(0.13)}
                className='max-w-md text-[14px] leading-[1.7] text-gray-500'
              >
                আমাদের বিস্তৃত পণ্যের তালিকা থেকে আপনার পছন্দের ক্যাটাগরিটি বেছে নিন
              </motion.p>
            </div>

            {/* Search input */}
            <motion.div {...fadeUp(0.18)} className='mb-8 max-w-md'>
              <div className='flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 transition focus-within:border-[#e94560]/40 focus-within:ring-2 focus-within:ring-[#e94560]/10'>
                <FaSearch className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                <input
                  type='text'
                  placeholder='ক্যাটাগরি সার্চ করুন...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400'
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className='text-[11px] text-gray-400 hover:text-gray-600'
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Loading state */}
            {loadingCategories ? (
              <div className='space-y-12'>
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx}>
                    <div className='mb-4 h-8 w-48 animate-pulse rounded-lg bg-gray-100' />
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className='overflow-hidden rounded-2xl border border-gray-100 bg-white'
                        >
                          <div className='aspect-[4/3] animate-pulse bg-gray-100' />
                          <div className='space-y-2 p-3'>
                            <div className='h-3 w-3/4 animate-pulse rounded-full bg-gray-100' />
                            <div className='h-3 w-1/2 animate-pulse rounded-full bg-gray-100' />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center'>
                <Package className='mb-3 h-12 w-12 text-gray-200' />
                <p className='mb-1 text-[15px] font-medium text-gray-600'>
                  কোন ক্যাটাগরি পাওয়া যায়নি
                </p>
                <p className='mb-4 text-[13px] text-gray-400'>অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className='rounded-xl bg-[#e94560] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
                  >
                    ক্লিয়ার করুন
                  </button>
                )}
              </div>
            ) : (
              // Grouped categories: each parent category becomes a section
              <div className='space-y-12'>
                {filteredCategories
                  .filter(c => c.subCategories && c.subCategories.length > 0)
                  .map((category, groupIdx) => (
                    <motion.div
                      key={category.categoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={catGridInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: Math.min(groupIdx * 0.1, 0.5), duration: 0.5 }}
                    >
                      {/* Parent category title */}
                      <div className='mb-4 flex items-center gap-2 border-l-4 border-[#e94560] pl-3'>
                        <h3 className='font-serif text-xl font-bold text-[#1a1a2e]'>
                          {category.name}
                        </h3>
                        {category.products > 0 && (
                          <span className='rounded-full bg-[#e94560]/10 px-2.5 py-0.5 text-xs font-medium text-[#e94560]'>
                            {category.products} টি পণ্য
                          </span>
                        )}
                      </div>

                      {/* Subcategories grid */}
                      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                        {category.subCategories?.map((sub, i) => (
                          <motion.div
                            key={sub.categoryId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={catGridInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                              delay: Math.min(i * 0.03, 0.3),
                              duration: 0.4,
                            }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigateToProducts(sub.categoryId)}
                            className='group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:border-transparent hover:shadow-[0_10px_32px_rgba(26,26,46,0.12)]'
                          >
                            <div className='relative aspect-[4/3] overflow-hidden bg-gray-50'>
                              {sub.categoryIcon ? (
                                <img
                                  src={sub.categoryIcon}
                                  alt={sub.name}
                                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]'
                                  onError={e => {
                                    ;(e.target as HTMLImageElement).src =
                                      'https://via.placeholder.com/400x300'
                                  }}
                                />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                  <Package className='h-10 w-10 text-gray-200' />
                                </div>
                              )}
                              <div className='absolute inset-0 bg-[#1a1a2e]/0 transition-all duration-300 group-hover:bg-[#1a1a2e]/25' />
                              {sub.products > 0 && (
                                <div className='absolute right-2 top-2'>
                                  <span className='rounded-full bg-[#e94560] px-2 py-0.5 text-[9px] font-bold text-white shadow'>
                                    {sub.products} পণ্য
                                  </span>
                                </div>
                              )}
                              <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg'>
                                  <FaArrowRight className='h-3.5 w-3.5 text-[#1a1a2e]' />
                                </div>
                              </div>
                            </div>
                            <div className='p-3'>
                              <h4 className='mb-0.5 line-clamp-1 text-[13px] font-semibold text-[#1a1a2e] transition group-hover:text-[#e94560]'>
                                {sub.name}
                              </h4>
                              <p className='line-clamp-1 text-[11px] text-gray-400'>
                                {sub.description || 'প্রিমিয়াম কালেকশন'}
                              </p>
                            </div>
                            <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-[#e94560] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* View all button (optional) */}
            {!loadingCategories && filteredCategories.length > 0 && (
              <motion.div {...fadeUp(0.2)} className='mt-12 text-center'>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateWithScroll(navigate, '/products')}
                  className='inline-flex items-center gap-2 rounded-xl border border-[#1a1a2e]/15 bg-white px-7 py-3 text-[13px] font-semibold text-[#1a1a2e] shadow-sm transition hover:border-[#e94560]/30 hover:bg-[#e94560]/5 hover:text-[#e94560]'
                >
                  সকল ক্যাটাগরি দেখুন
                  <FaArrowRight className='h-3 w-3' />
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>

        {/* TRUST BADGES - unchanged */}
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage
