// LoginPage.tsx — BazaarHub design system (cleaned spacing)
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiKey, FiLock, FiLogIn, FiPhone, FiUserPlus } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { login } from '../Api/auth.api'
import { localStorageAvailable } from '../Axios/baseUrl'
import { useAuth } from '../Hooks/useAuth'
import Footer from './Footer'

const validationSchema = Yup.object().shape({
  mobileNumber: Yup.string()
    .matches(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
    .required('মোবাইল নম্বর প্রয়োজন'),
  password: Yup.string()
    .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
    .max(16, 'পাসওয়ার্ড সর্বাধিক ১৬ অক্ষরের হতে হবে')
    .required('পাসওয়ার্ড প্রয়োজন'),
})

const InputField = ({
  name,
  label,
  type,
  placeholder,
  icon: Icon,
  suffix,
}: {
  name: string
  label: string
  type: string
  placeholder: string
  icon: React.ElementType
  suffix?: React.ReactNode
}) => (
  <div>
    <label className='mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.6px] text-white/40'>
      {label}
    </label>
    <div className='relative'>
      <Icon className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25' />
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className='w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-11 text-[14px] text-white placeholder:text-white/20 outline-none transition-all focus:border-[#e94560]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#e94560]/15'
      />
      {suffix && <div className='absolute right-3 top-1/2 -translate-y-1/2'>{suffix}</div>}
    </div>
    <ErrorMessage name={name} component='p' className='mt-1 text-[11px] text-[#e94560]' />
  </div>
)

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { mobileNumber: preFilledMobile, password: preFilledPassword } = location.state || {}

  const handleLogin = async (values: { mobileNumber: string; password: string }) => {
    setError(null)
    try {
      const result = await login({ phoneNo: values.mobileNumber, password: values.password })
      if (result.success) {
        if (result.data.user.role === 'Seller') {
          setUser(result.data?.user)
          if (localStorageAvailable) localStorage.setItem('token', result.data?.token)
          navigate('/home', { replace: true })
        } else {
          setError('আপনার একাউন্ট সেলার হিসেবে নিবন্ধিত নয়।')
        }
      } else {
        setError(result.message || 'লগইন করতে ব্যর্থ হয়েছে')
      }
    } catch {
      setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
    }
  }

  useEffect(() => {
    if (preFilledMobile && preFilledPassword && !autoLoginAttempted) {
      setAutoLoginAttempted(true)
      handleLogin({ mobileNumber: preFilledMobile, password: preFilledPassword })
    }
  }, [preFilledMobile, preFilledPassword, autoLoginAttempted])

  return (
    <>
      <div className='relative min-h-screen overflow-hidden bg-[#1a1a2e]' id='login'>
        {/* Top rose accent */}
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />

        {/* Geometric grid texture */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Decorative circles – kept but no overflow */}
        <div className='pointer-events-none absolute -right-48 top-0 h-[600px] w-[600px] rounded-full border border-[#e94560]/[0.05]' />
        <div className='pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full border border-white/[0.03]' />

        {/* Main content – padding top for fixed header, no extra margins */}
        <div className='flex min-h-screen flex-col pt-16'>
          {/* Split layout – removed unnecessary padding from containers */}
          <div className='flex flex-1'>
            {/* Left panel – no extra margins, clean spacing */}
            <div className='hidden flex-col justify-between p-12 lg:flex lg:w-5/12 xl:w-1/2'>
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className='mb-4 text-[11px] font-semibold uppercase tracking-[1px] text-[#e94560]'
                >
                  বাংলাদেশের নির্ভরযোগ্য ড্রপশিপিং ও রিসেলিং প্ল্যাটফর্ম
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className='font-serif my-5 text-[clamp(32px,4vw,52px)] font-bold leading-[1.07] tracking-tight text-white'
                >
                  আপনার ব্যবসা,
                  <br />
                  <span className='text-white/30'>আপনার শর্তে।</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className='mt-8 space-y-4'
                >
                  {[
                    'শূন্য বিনিয়োগে ব্যবসা শুরু',
                    'প্রতিটি অর্ডারে তাৎক্ষণিক আয়',
                    '২৪/৭ ডেডিকেটেড সাপোর্ট',
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className='flex items-center gap-3'
                    >
                      <div className='h-1.5 w-1.5 rounded-full bg-[#e94560]' />
                      <span className='text-[14px] text-white/50'>{text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <p className='text-[11px] text-white/20'>
                © {new Date().getFullYear()} BazaarHub — সকল স্বত্ব সংরক্ষিত
              </p>
            </div>

            {/* Right panel – centered form with consistent padding */}
            <div className='flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:border-l lg:border-white/[0.06] lg:bg-white/[0.015]'>
              <div className='w-full max-w-md'>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className='mb-6'
                >
                  <p className='text-[13px] text-white/35'>আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className='mb-5 flex items-start gap-3 rounded-xl border border-[#e94560]/25 bg-[#e94560]/10 px-4 py-3'
                    >
                      <div className='mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e94560]'>
                        <span className='text-[9px] font-bold text-white'>!</span>
                      </div>
                      <p className='text-[13px] text-[#e94560]'>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Formik
                  initialValues={{
                    mobileNumber: preFilledMobile || '',
                    password: preFilledPassword || '',
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleLogin}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form className='space-y-4'>
                      <InputField
                        name='mobileNumber'
                        label='মোবাইল নম্বর'
                        type='tel'
                        placeholder='01XXXXXXXXX'
                        icon={FiPhone}
                      />
                      <InputField
                        name='password'
                        label='পাসওয়ার্ড'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        icon={FiLock}
                        suffix={
                          <button
                            type='button'
                            onClick={() => setShowPassword(p => !p)}
                            className='text-white/30 transition hover:text-white/60'
                          >
                            {showPassword ? (
                              <FiEyeOff className='h-4 w-4' />
                            ) : (
                              <FiEye className='h-4 w-4' />
                            )}
                          </button>
                        }
                      />

                      <div className='pt-2'>
                        <motion.button
                          type='submit'
                          disabled={isSubmitting}
                          whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(233,69,96,0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          className='flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#e94560] py-3.5 text-[14px] font-semibold text-white transition disabled:opacity-60'
                        >
                          {isSubmitting ? (
                            <>
                              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                              লগইন হচ্ছে...
                            </>
                          ) : (
                            <>
                              <FiLogIn className='h-4 w-4' />
                              লগইন করুন
                            </>
                          )}
                        </motion.button>
                      </div>
                    </Form>
                  )}
                </Formik>

                <div className='my-6 flex items-center gap-3'>
                  <div className='h-px flex-1 bg-white/[0.06]' />
                  <span className='text-[11px] text-white/20'>অথবা</span>
                  <div className='h-px flex-1 bg-white/[0.06]' />
                </div>

                <div className='flex flex-col gap-3 sm:flex-row'>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/register')}
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[13px] font-medium text-white/60 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                  >
                    <FiUserPlus className='h-3.5 w-3.5' />
                    নতুন অ্যাকাউন্ট
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/forgot-password')}
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-[13px] font-medium text-white/60 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                  >
                    <FiKey className='h-3.5 w-3.5' />
                    পাসওয়ার্ড ভুলেছেন?
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default LoginPage
