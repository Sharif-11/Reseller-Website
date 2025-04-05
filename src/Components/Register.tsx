import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import OTPForm from "./OTPForm";
import RegistrationInfo from "./RegistrationInfo";
import OTPValidation from "./ValidateOTP";

const Register = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [page, setPage] = useState(2);
  const [mobileNumber, setMobileNumber] = useState("01776775495");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
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
    </div>
  );
};

export default Register;