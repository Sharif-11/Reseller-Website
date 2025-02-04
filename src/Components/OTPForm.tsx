import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { sendOtp } from "../Api/otp.api";

const OTPForm = ({
  mobileNumber,
  setMobileNumber,
  setPage,
}: {
  mobileNumber: string;
  setMobileNumber: React.Dispatch<React.SetStateAction<string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [error, setError] = useState<string | null>(null);
  const validationSchema = Yup.object({
    mobileNumber: Yup.string()
      .matches(/^01\d{9}$/, "Mobile number is not valid")
      .required("Mobile number is required"),
  });

  const handleSendOTP = async ({
    mobileNumber: mobileNo,
  }: {
    mobileNumber: string;
  }) => {
    setError(null);
    const { data, message } = await sendOtp(mobileNo);

    if (data?.isVerified) {
      setPage(2);
    } else if (data?.sendOTP) {
      setPage(1);
    } else {
      setError(message);
    }
    setMobileNumber(mobileNo);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(135,89,78)] text-center mb-4 sm:mb-6">
          রিসেলার রেজিস্ট্রেশন
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4">
          আপনার মোবাইলে একটি OTP কোড পাঠানো হবে, কোডটি দিয়ে রেজিস্ট্রেশন
          সম্পূর্ণ করুন।
        </p>
        <Formik
          initialValues={{ mobileNumber }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSendOTP(values)}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Mobile Number Input */}
              <div className="mb-3 sm:mb-4">
                <label
                  htmlFor="mobile"
                  className="block text-gray-700 font-medium mb-1 sm:mb-2"
                >
                  মোবাইল নম্বর*
                </label>
                <Field
                  id="mobile"
                  name="mobileNumber"
                  type="text"
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
                />
                <ErrorMessage
                  name="mobileNumber"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[rgb(135,89,78)] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[rgb(110,72,63)] transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "অপেক্ষা করুন..." : "OTP পাঠান"}
              </button>
              <p className="text-[red] text-center text-xs my-[3px] font-[600]">
                {error}
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OTPForm;
