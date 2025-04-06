import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { FiLock, FiCheck, FiArrowRight } from "react-icons/fi";
import * as Yup from "yup";
import { changePassword } from "../Api/auth.api";

const ChangePasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      .required("পুরোনো পাসওয়ার্ড প্রয়োজন"),
    newPassword: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      .notOneOf(
        [Yup.ref("currentPassword")],
        "নতুন পাসওয়ার্ড পুরোনো পাসওয়ার্ডের মতো হতে পারবে না"
      )
      .required("নতুন পাসওয়ার্ড প্রয়োজন"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "পাসওয়ার্ড মিলছে না")
      .required("পাসওয়ার্ড নিশ্চিত করুন"),
  });

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const { success, message } = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      if (success) {
        setSuccess("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে");
      } else {
        setError(message || "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">পাসওয়ার্ড পরিবর্তন করুন</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            আপনার অ্যাকাউন্টের নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
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
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
              <FiCheck className="flex-shrink-0" />
              {success}
            </div>
          )}

          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleChangePassword}
          >
            {({ touched, errors }) => (
              <Form className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiLock />
                    পুরোনো পাসওয়ার্ড *
                  </label>
                  <Field
                    name="currentPassword"
                    type="password"
                    placeholder="আপনার বর্তমান পাসওয়ার্ড"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      touched.currentPassword && errors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiLock />
                    নতুন পাসওয়ার্ড *
                  </label>
                  <Field
                    name="newPassword"
                    type="password"
                    placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      touched.newPassword && errors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiLock />
                    পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
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
                      পাসওয়ার্ড পরিবর্তন করুন
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;