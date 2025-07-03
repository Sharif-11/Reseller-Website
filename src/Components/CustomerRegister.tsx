import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '../Api/auth.api'
import Footer from './Footer'
import OTPForm from './OTPForm'
import RegistrationConfirmation from './RegistrationConfirmation'
import OTPValidation from './ValidateOTP'

const CustomerRegister = () => {
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('customer_ref') || null
  const [page, setPage] = useState(0)
  const [mobileNumber, setMobileNumber] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState({ success: false, message: '' })

  const customerRegistration = async () => {
    try {
      const { success, message } = await authApi.createCustomer({
        customerPhoneNo: mobileNumber,
        sellerCode: referralCode!,
      })
      setRegistrationStatus({ success, message: message! })
    } catch (error) {
      setRegistrationStatus({ success: false, message: 'কাস্টমার রেজিস্ট্রেশন ব্যর্থ হয়েছে।' })
    }
  }

  useEffect(() => {
    page === 2 && customerRegistration()
  }, [page])

  return (
    <div className='pt-4' id='register'>
      {page === 0 && (
        <OTPForm mobileNumber={mobileNumber} setMobileNumber={setMobileNumber} setPage={setPage} />
      )}
      {page === 1 && <OTPValidation mobileNumber={mobileNumber} setPage={setPage} />}
      {page === 2 && <RegistrationConfirmation {...registrationStatus} setPage={setPage} />}
      <Footer />
    </div>
  )
}

export default CustomerRegister
