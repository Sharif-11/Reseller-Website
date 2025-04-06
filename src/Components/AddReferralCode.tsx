import { useFormik } from "formik";
import { useState } from "react";
import { FiUserPlus, FiCheck, FiArrowRight } from "react-icons/fi";
import * as Yup from "yup";
import { addReferralCode } from "../Api/seller.api";
import { useAuth } from "../Hooks/useAuth";

const AddReferralCode = () => {
  const { setUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      referralCode: "",
    },
    validationSchema: Yup.object({
      referralCode: Yup.string()
        .trim()
        .min(3, "রেফারাল কোড কমপক্ষে ৩ অক্ষরের হতে হবে")
        .max(32, "রেফারাল কোড ৩২ অক্ষরের বেশি হতে পারবে না")
        .matches(
          /^[a-zA-Z0-9-_]+$/,
          "শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) ব্যবহার করুন"
        )
        .required("রেফারাল কোড আবশ্যক"),
    }),
    onSubmit: async (values) => {
      setError(null);
      setSuccessMessage(null);
      setIsLoading(true);
      
      try {
        const result = await addReferralCode(values.referralCode);
        if (result.success) {
          setSuccessMessage("রেফারাল কোড সফলভাবে যোগ করা হয়েছে!");
          setUser(result?.data);
        } else {
          setError(result.message || "রেফারাল কোড যোগ করতে সমস্যা হয়েছে");
        }
      } catch (err) {
        setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen  flex items-start justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r  p-6 text-center text-white">
          <h1 className="text-2xl font-bold">রেফারাল কোড যোগ করুন</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            আপনার রেফারাল কোডটি এখানে প্রবেশ করুন
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
              <FiCheck className="flex-shrink-0" />
              {successMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Referral Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiUserPlus className="text-indigo-600" />
                রেফারাল কোড *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  formik.touched.referralCode && formik.errors.referralCode
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="রেফারাল কোড লিখুন"
                {...formik.getFieldProps("referralCode")}
              />
              {formik.touched.referralCode && formik.errors.referralCode && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.referralCode}
                </p>
              )}
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
                  কোড যোগ করুন
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReferralCode;