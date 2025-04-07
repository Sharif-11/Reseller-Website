import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { FiSmartphone, FiArrowRight } from "react-icons/fi";
import * as Yup from "yup";
import { forgotPassword } from "../Api/auth.api";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  phoneNo: Yup.string()
    .required("ফোন নম্বর প্রয়োজন")
    .matches(/^01\d{9}$/, "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"),
});

const PasswordReset = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: { phoneNo: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      const { success, message } = await forgotPassword(values);
      if (success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(message || "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-start justify-center py-16 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">পাসওয়ার্ড রিসেট</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            পাসওয়ার্ড রিসেট করতে আপনার মোবাইল নম্বর দিন
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              পাসওয়ার্ড রিসেট লিঙ্ক সফলভাবে পাঠানো হয়েছে। লগিন পেজে রিডাইরেক্ট হচ্ছে...
            </div>
          )}

          <Formik
            initialValues={{ phoneNo: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ touched, errors }) => (
              <Form className="space-y-4">
                {/* Phone Number Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiSmartphone />
                    মোবাইল নম্বর *
                  </label>
                  <Field
                    name="phoneNo"
                    type="text"
                    placeholder="01XXXXXXXXX"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      touched.phoneNo && errors.phoneNo
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="phoneNo"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      পাসওয়ার্ড রিসেট করুন
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Back to Login Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              লগিন পেজে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;