import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import OTPForm from "./OTPForm";
import RegistrationInfo from "./RegistrationInfo";
import OTPValidation from "./ValidateOTP";
import Footer from "./Footer";

const Register = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [page, setPage] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  
  return (
    <div className="pt-4" id='register'>
      {page === 0 && (
        <OTPForm
          mobileNumber={mobileNumber}
          setMobileNumber={setMobileNumber}
          setPage={setPage}
        />
      )}
      {page === 1 && (
        <OTPValidation mobileNumber={mobileNumber} setPage={setPage} />
      )}
      {page === 2 && (
        <RegistrationInfo
          mobileNumber={mobileNumber}
          referralCode={referralCode}
        />
      )}
      <Footer/>
    </div>
  );
};

export default Register;