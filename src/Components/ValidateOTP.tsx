import { useFormik } from "formik";
import { useState } from "react";
import { FiKey, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import * as Yup from "yup";
import { sendOtp, verifyOtp } from "../Api/otp.api";

const OTPValidation = ({
  mobileNumber,
  setPage,
}: {
  mobileNumber: string;
  setPage: (value: number) => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, "ওটিপি ৬ ডিজিটের হতে হবে")
      .required("ওটিপি প্রবেশ করান")
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await verifyOtp(mobileNumber, values.otp);
        if (result.success) {
          setPage(2); // রেজিস্ট্রেশন তথ্য পৃষ্ঠায় যান
        } else {
          setError(result.message || "ওটিপি যাচাই ব্যর্থ হয়েছে");
        }
      } catch (error) {
        setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);
    try {
      const result = await sendOtp(mobileNumber);
      if (result.success) {
        setResendSuccess(true);
      } else {
        setError(result.message || "ওটিপি পুনরায় পাঠানো ব্যর্থ হয়েছে");
      }
    } catch (error) {
      setError("ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className=" flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-center text-white">
          <h1 className="text-xl font-bold">ওটিপি যাচাইকরণ</h1>
          <p className="text-indigo-100 text-xs mt-1">
            {mobileNumber} নম্বরে পাঠানো ৬ ডিজিটের কোড লিখুন
          </p>
        </div>

        {/* Form */}
        <div className="p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-md text-xs">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-3 p-2 bg-green-50 text-green-600 rounded-md text-xs">
              ওটিপি সফলভাবে পুনরায় পাঠানো হয়েছে
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-3">
            {/* OTP Field */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiKey className="text-indigo-600" />
                ওটিপি কোড *
              </label>
              <input
                
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="৬ ডিজিটের ওটিপি"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-lg text-xs ${
                  formik.touched.otp && formik.errors.otp
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("otp")}
              />
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-red-500 text-[10px] mt-1">{formik.errors.otp}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
              >
                <FiRefreshCw className={`text-xs ${resendLoading ? "animate-spin" : ""}`} />
                {resendLoading ? "পাঠানো হচ্ছে..." : "পুনরায় পাঠান"}
              </button>

              <button
                type="button"
                onClick={() => setPage(0)}
                className="text-gray-600 hover:text-gray-800 text-xs flex items-center gap-1"
              >
                <FiArrowLeft className="text-xs" />
                নম্বর পরিবর্তন
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                "যাচাই করুন"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPValidation;