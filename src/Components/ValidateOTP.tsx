import { useFormik } from "formik";
import { useState } from "react";
import { FiKey } from "react-icons/fi";
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
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
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
          setPage(2); // Move to registration info page
        } else {
          setError(result.message || "OTP verification failed");
        }
      } catch (error) {
        setError("An error occurred, please try again later");
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
      // You'll need to implement the resendOtp function in your otp.api.ts
      const result = await sendOtp(mobileNumber);
      if (result.success) {
        setResendSuccess(true);
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("An error occurred while resending OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">OTP Verification</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            Enter the 6-digit OTP sent to {mobileNumber}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              OTP has been resent successfully
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
              >
                <FiKey />
                OTP Code *
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={formik.values.otp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  formik.touched.otp && formik.errors.otp
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.otp}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => setPage(0)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Change Number
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPValidation;