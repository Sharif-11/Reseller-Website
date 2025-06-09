import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomerRegistration from './CustomerRegistration'
import Footer from './Footer'
import OTPForm from './OTPForm'
import OTPValidation from './ValidateOTP'

const CustomerRegister = () => {
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('customer_ref') || null
  const [page, setPage] = useState(0)
  const [mobileNumber, setMobileNumber] = useState('')

  return (
    <div className='pt-4' id='register'>
      {page === 0 && (
        <OTPForm mobileNumber={mobileNumber} setMobileNumber={setMobileNumber} setPage={setPage} />
      )}
      {page === 1 && <OTPValidation mobileNumber={mobileNumber} setPage={setPage} />}
      {page === 2 && (
        <CustomerRegistration mobileNumber={mobileNumber} referralCode={referralCode} />
      )}
      <Footer />
    </div>
  )
}

export default CustomerRegister
