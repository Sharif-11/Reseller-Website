// UnifiedRegistration.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
import { useFormik } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiCheck, FiLock, FiMapPin, FiPhone, FiRefreshCw, FiUser, FiX, FiZap } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { register, RegisterInfo } from '../Api/auth.api'
import { sendOtp, verifyOtp } from '../Api/otp.api'
import { omitEmptyStringKeys } from '../utils/omitEmptyStrings'
import Footer from './Footer'

const DRAFT_KEY = 'registration_draft'

interface FormValues {
  phoneNo: string
  name: string
  zilla: string
  upazilla: string
  address: string
  password: string
  confirmPassword: string
  referralCode: string
}

/* ─── Reusable styled field ─── */
const Field = ({
  label,
  error,
  touched,
  required,
  children,
}: {
  label: string
  error?: string
  touched?: boolean
  required?: boolean
  children: React.ReactNode
}) => (
  <div>
    <label className='mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.6px] text-[#1a1a2e]/50'>
      {label}
      {required && <span className='ml-0.5 text-[#e94560]'>*</span>}
    </label>
    {children}
    {touched && error && <p className='mt-1 text-[11px] text-[#e94560]'>{error}</p>}
  </div>
)

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-2.5 text-[14px] text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all focus:ring-2 ${
    hasError
      ? 'border-[#e94560]/40 focus:border-[#e94560]/60 focus:ring-[#e94560]/10'
      : 'border-gray-200 bg-[#f7f6f3] focus:border-[#1a1a2e]/30 focus:bg-white focus:ring-[#1a1a2e]/8'
  }`

/* ─── Step indicator ─── */
const StepDot = ({ active, done }: { active: boolean; done: boolean }) => (
  <div
    className={`h-2 w-2 rounded-full transition-all duration-300 ${
      done ? 'bg-emerald-500' : active ? 'bg-[#e94560]' : 'bg-gray-200'
    }`}
  />
)

/* ─── OTP Modal ─── */
const OtpModal = ({
  phoneNo,
  onVerify,
  onClose,
}: {
  phoneNo: string
  onVerify: (otp: string) => Promise<void>
  onClose: () => void
}) => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('ওটিপি ৬ ডিজিটের হতে হবে')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onVerify(otp)
    } catch {
      setError('ওটিপি যাচাইয়ে ত্রুটি হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError(null)
    try {
      const r = await sendOtp(phoneNo)
      if (r.data?.alreadySent) setError(r.data.message || 'ইতিমধ্যে পাঠানো হয়েছে')
      else if (r.success) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 3000)
      } else setError(r.message || 'পুনরায় পাঠানো ব্যর্থ হয়েছে')
    } catch {
      setError('পুনরায় পাঠাতে সমস্যা হয়েছে')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    /* Faux viewport — not fixed, flows in layout */
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/80 p-4 backdrop-blur-sm'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className='relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a2e] shadow-2xl'
      >
        {/* Top accent */}
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />

        {/* Header */}
        <div className='flex items-start justify-between p-6 pb-4'>
          <div>
            <h3 className='font-serif text-[20px] font-bold text-white'>ওটিপি যাচাইকরণ</h3>
            <p className='mt-1 text-[12px] text-white/35'>
              {phoneNo} নম্বরে পাঠানো ৬ ডিজিটের কোড লিখুন
            </p>
          </div>
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition hover:text-white'
          >
            <FiX className='h-3.5 w-3.5' />
          </button>
        </div>

        <div className='px-6 pb-6'>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='mb-4 rounded-xl border border-[#e94560]/25 bg-[#e94560]/10 px-3 py-2 text-[12px] text-[#e94560]'
              >
                {error}
              </motion.p>
            )}
            {resendSuccess && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-400'
              >
                ওটিপি সফলভাবে পুনরায় পাঠানো হয়েছে
              </motion.p>
            )}
          </AnimatePresence>

          {/* OTP Input */}
          <input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='• • • • • •'
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            className='w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-4 text-center font-mono text-[22px] font-bold tracking-[0.5em] text-white outline-none placeholder:text-white/15 transition focus:border-[#e94560]/50 focus:ring-2 focus:ring-[#e94560]/15'
          />

          <div className='mt-4 flex items-center justify-between'>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className='flex items-center gap-1.5 text-[12px] text-white/35 transition hover:text-white/70 disabled:opacity-50'
            >
              <FiRefreshCw className={`h-3 w-3 ${resendLoading ? 'animate-spin' : ''}`} />
              পুনরায় পাঠান
            </button>
            <motion.button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(233,69,96,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className='flex items-center gap-2 rounded-xl bg-[#e94560] px-5 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-50'
            >
              {loading ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
              ) : (
                <FiCheck className='h-3.5 w-3.5' />
              )}
              যাচাই করুন
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ════════════════════════════════════════════ */
const UnifiedRegistration = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')

  const [error, setError] = useState<string | null>(null)
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)

  const validationSchema = Yup.object({
    phoneNo: Yup.string()
      .matches(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      .required('মোবাইল নম্বর প্রয়োজন'),
    name: Yup.string().min(3, 'নাম অবশ্যই ৩ অক্ষরের বেশি হতে হবে').max(48).required('নাম আবশ্যক'),
    zilla: Yup.string().required('জেলা নির্বাচন করুন').max(48),
    upazilla: Yup.string().required('উপজেলা নির্বাচন করুন').max(48),
    address: Yup.string()
      .min(10, 'ঠিকানা আরও বিস্তারিত হতে হবে')
      .max(255)
      .required('ঠিকানা আবশ্যক'),
    password: Yup.string()
      .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      .required('পাসওয়ার্ড আবশ্যক'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'পাসওয়ার্ড মেলেনি')
      .required('পাসওয়ার্ড নিশ্চিত করুন'),
  })

  const saveReferralCode = () => {
    if (referralCode) {
      try {
        localStorage.setItem('referral_code', referralCode)
      } catch {}
    }
  }
  const clearReferralCode = () => {
    try {
      localStorage.removeItem('referral_code')
    } catch {}
  }

  useEffect(() => {
    saveReferralCode()
  }, [referralCode])

  const loadDraft = (): FormValues => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        return {
          phoneNo: d.phoneNo || '',
          name: d.name || '',
          zilla: d.zilla || '',
          upazilla: d.upazilla || '',
          address: d.address || '',
          password: '',
          confirmPassword: '',
          referralCode: referralCode || d.referralCode || '',
        }
      }
    } catch {}
    return {
      phoneNo: '',
      name: '',
      zilla: '',
      upazilla: '',
      address: '',
      password: '',
      confirmPassword: '',
      referralCode: referralCode || '',
    }
  }

  const saveDraft = (v: FormValues) => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          phoneNo: v.phoneNo,
          name: v.name,
          zilla: v.zilla,
          upazilla: v.upazilla,
          address: v.address,
          referralCode: v.referralCode,
        })
      )
    } catch {}
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }

  const formik = useFormik({
    initialValues: loadDraft(),
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setIsLoading(true)
      try {
        const r = await sendOtp(values.phoneNo)
        if (r.success) {
          if (r.data.isVerified) await handleRegistration(values)
          else {
            setShowOtpModal(true)
            setIsLoading(false)
          }
        } else {
          setError(r.message || 'OTP পাঠাতে ব্যর্থ')
          setIsLoading(false)
        }
      } catch {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
        setIsLoading(false)
      }
    },
  })

  useEffect(() => {
    const t = setTimeout(() => {
      if (Object.values(formik.values).some(v => v.trim() !== '')) saveDraft(formik.values)
    }, 1000)
    return () => clearTimeout(t)
  }, [formik.values])

  useEffect(() => {
    const h = () => {
      if (Object.values(formik.values).some(v => v.trim() !== '')) saveDraft(formik.values)
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [formik.values])

  useEffect(() => {
    if (formik.values.zilla)
      setUpazillas(districts[formik.values.zilla as keyof typeof districts] || [])
  }, [])

  const handleRegistration = async (values: FormValues) => {
    try {
      const { confirmPassword, ...payload } = values
      const data = omitEmptyStringKeys({
        ...payload,
        shopName: `${payload.name}'s Shop`,
      }) as RegisterInfo
      const { success, message } = await register(data)
      if (success) {
        clearDraft()
        clearReferralCode()
        navigate('/login', { state: { mobileNumber: values.phoneNo, password: values.password } })
      } else {
        setError(message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে')
        setShowOtpModal(false)
      }
    } catch {
      setError('রেজিস্ট্রেশনে একটি ত্রুটি ঘটেছে')
      setShowOtpModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (otp: string) => {
    const r = await verifyOtp(formik.values.phoneNo, otp)
    if (r.success) {
      setShowOtpModal(false)
      setIsLoading(true)
      await handleRegistration(formik.values)
    } else throw new Error(r.message || 'ওটিপি যাচাই ব্যর্থ')
  }

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const z = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', z)
    formik.setFieldValue('upazilla', '')
    setUpazillas(z ? districts[z] || [] : [])
  }

  // Calculate form completion %
  const fields = [
    'phoneNo',
    'name',
    'zilla',
    'upazilla',
    'address',
    'password',
    'confirmPassword',
  ] as const
  const filled = fields.filter(f => !!formik.values[f]).length
  const progress = Math.round((filled / fields.length) * 100)

  const e = (f: keyof FormValues) => !!(formik.touched[f] && formik.errors[f])

  return (
    <div className='bg-[#f7f6f3]' id='register'>
      <AnimatePresence>
        {showOtpModal && (
          <OtpModal
            phoneNo={formik.values.phoneNo}
            onVerify={handleOtpVerify}
            onClose={() => setShowOtpModal(false)}
          />
        )}
      </AnimatePresence>

      <div className='mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl'>
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-8 text-center'
          >
            <h1 className='mb-2 font-serif text-[clamp(26px,3.5vw,40px)] font-bold tracking-tight text-[#1a1a2e] mt-8'>
              নতুন অ্যাকাউন্ট তৈরি করুন
            </h1>
          </motion.div>

          {/* Progress bar */}
          <div className='mb-6'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-[11px] font-medium text-gray-400'>ফর্ম সম্পূর্ণতা</span>
              <span className='text-[11px] font-semibold text-[#1a1a2e]'>{progress}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
              <motion.div
                className='h-full rounded-full bg-[#e94560]'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'
          >
            {/* Card top bar */}
            <div className='relative overflow-hidden bg-[#1a1a2e] px-6 py-5'>
              <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
              <div
                className='pointer-events-none absolute inset-0'
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className='relative flex items-center justify-between'>
                <div>
                  <h2 className='font-serif text-[18px] font-semibold text-white'>
                    রেজিস্ট্রেশন ফর্ম
                  </h2>
                  <p className='mt-0.5 text-[12px] text-white/35'>সকল তথ্য সঠিকভাবে পূরণ করুন</p>
                </div>
                <div className='flex gap-1.5'>
                  {fields.map((f, i) => (
                    <StepDot
                      key={i}
                      active={!!formik.values[f] && !formik.errors[f]}
                      done={!!formik.values[f] && !formik.errors[f]}
                    />
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className='p-6 sm:p-8'>
              <div className='grid gap-4 sm:grid-cols-2'>
                {/* Phone */}
                <div className='sm:col-span-2'>
                  <Field
                    label='মোবাইল নম্বর'
                    required
                    error={formik.errors.phoneNo}
                    touched={formik.touched.phoneNo}
                  >
                    <div className='relative'>
                      <FiPhone className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300' />
                      <input
                        type='text'
                        placeholder='01XXXXXXXXX'
                        className={`${inputClass(e('phoneNo'))} pl-10`}
                        {...formik.getFieldProps('phoneNo')}
                      />
                    </div>
                  </Field>
                </div>

                {/* Name */}
                <div>
                  <Field
                    label='পুরো নাম'
                    required
                    error={formik.errors.name}
                    touched={formik.touched.name}
                  >
                    <div className='relative'>
                      <FiUser className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300' />
                      <input
                        type='text'
                        placeholder='পুরো নাম লিখুন'
                        className={`${inputClass(e('name'))} pl-10`}
                        {...formik.getFieldProps('name')}
                      />
                    </div>
                  </Field>
                </div>

                {/* District */}
                <div>
                  <Field
                    label='জেলা'
                    required
                    error={formik.errors.zilla}
                    touched={formik.touched.zilla}
                  >
                    <div className='relative'>
                      <FiMapPin className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300' />
                      <select
                        className={`${inputClass(e('zilla'))} pl-10 appearance-none`}
                        {...formik.getFieldProps('zilla')}
                        onChange={handleZillaChange}
                      >
                        <option value=''>জেলা নির্বাচন করুন</option>
                        {Object.keys(districts).map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                </div>

                {/* Upazilla */}
                <div>
                  <Field
                    label='উপজেলা'
                    required
                    error={formik.errors.upazilla}
                    touched={formik.touched.upazilla}
                  >
                    <select
                      className={`${inputClass(e('upazilla'))} disabled:opacity-40`}
                      {...formik.getFieldProps('upazilla')}
                      disabled={!formik.values.zilla}
                    >
                      <option value=''>উপজেলা নির্বাচন করুন</option>
                      {upazillas.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Address */}
                <div className='sm:col-span-2'>
                  <Field
                    label='সম্পূর্ণ ঠিকানা'
                    required
                    error={formik.errors.address}
                    touched={formik.touched.address}
                  >
                    <textarea
                      rows={3}
                      placeholder='গ্রাম/রোড নং, ইউনিয়ন/ওয়ার্ড, পোস্ট অফিস'
                      className={inputClass(e('address'))}
                      {...formik.getFieldProps('address')}
                    />
                  </Field>
                </div>

                {/* Referral Code */}
                <div className='sm:col-span-2'>
                  <Field
                    label='রেফারাল কোড (ঐচ্ছিক)'
                    error={formik.errors.referralCode}
                    touched={formik.touched.referralCode}
                  >
                    <div className='relative'>
                      <FiZap className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300' />
                      <input
                        type='text'
                        placeholder='রেফারাল কোড লিখুন'
                        className={`${inputClass(e('referralCode'))} pl-10 ${referralCode ? 'cursor-not-allowed opacity-70' : ''}`}
                        {...formik.getFieldProps('referralCode')}
                        value={referralCode || formik.values.referralCode}
                        onChange={e => {
                          if (!referralCode) formik.handleChange(e)
                        }}
                        readOnly={!!referralCode}
                      />
                      {referralCode && (
                        <div className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-0.5'>
                          <span className='text-[10px] font-semibold text-emerald-600'>
                            স্বয়ংক্রিয়
                          </span>
                        </div>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Password */}
                <div>
                  <Field
                    label='পাসওয়ার্ড'
                    required
                    error={formik.errors.password}
                    touched={formik.touched.password}
                  >
                    <div className='relative'>
                      <FiLock className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300' />
                      <input
                        type='password'
                        placeholder='অন্তত ৬ অক্ষর'
                        className={`${inputClass(e('password'))} pl-10`}
                        {...formik.getFieldProps('password')}
                      />
                    </div>
                  </Field>
                </div>

                {/* Confirm Password */}
                <div>
                  <Field
                    label='পাসওয়ার্ড নিশ্চিত করুন'
                    required
                    error={formik.errors.confirmPassword}
                    touched={formik.touched.confirmPassword}
                  >
                    <input
                      type='password'
                      placeholder='পাসওয়ার্ড আবার লিখুন'
                      className={inputClass(e('confirmPassword'))}
                      {...formik.getFieldProps('confirmPassword')}
                    />
                  </Field>
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='mt-4 flex items-start gap-2.5 rounded-xl border border-[#e94560]/25 bg-[#e94560]/8 px-4 py-3'
                  >
                    <div className='mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#e94560] flex items-center justify-center'>
                      <span className='text-[9px] font-bold text-white'>!</span>
                    </div>
                    <p className='text-[13px] text-[#e94560]'>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className='mt-6'>
                <motion.button
                  type='submit'
                  disabled={isLoading || !formik.isValid}
                  whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(233,69,96,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className='flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#e94560] py-3.5 text-[14px] font-semibold text-white transition disabled:opacity-50'
                >
                  {isLoading ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FiCheck className='h-4 w-4' />
                      রেজিস্ট্রেশন সম্পন্ন করুন
                    </>
                  )}
                </motion.button>

                <p className='mt-3 text-center text-[12px] text-gray-400'>
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type='button'
                    onClick={() => navigate('/login')}
                    className='font-semibold text-[#e94560] hover:underline'
                  >
                    লগইন করুন
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default UnifiedRegistration
