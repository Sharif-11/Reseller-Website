import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { changePassword } from "../Api/auth.api";

const ChangePasswordPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      .required("পুরোনো পাসওয়ার্ড প্রয়োজন"),
    newPassword: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      .required("নতুন পাসওয়ার্ড প্রয়োজন"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), ""], "পাসওয়ার্ড মিলছে না")
      .required("পাসওয়ার্ড নিশ্চিত করুন"),
  });

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setError(null);
    setSuccess(null);
    const { currentPassword, newPassword } = values;
    const { success, message } = await changePassword({
      currentPassword,
      newPassword,
    });
    if (success) {
      setSuccess("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে");
    } else {
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(135,89,78)] text-center mb-4 sm:mb-6">
          পাসওয়ার্ড পরিবর্তন করুন
        </h1>
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleChangePassword}
        >
          {({ isSubmitting, values }) => (
            <Form>
              {/* Old Password */}
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  পুরোনো পাসওয়ার্ড*
                </label>
                <Field
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="পুরোনো পাসওয়ার্ড লিখুন"
                  value={values.currentPassword} // Ensure value is set
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
                />
                <ErrorMessage
                  name="currentPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  নতুন পাসওয়ার্ড*
                </label>
                <Field
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  value={values.newPassword} // Ensure value is set
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
                />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  পাসওয়ার্ড নিশ্চিত করুন*
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                  value={values.confirmPassword} // Ensure value is set
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[rgb(135,89,78)] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[rgb(110,72,63)] transition"
              >
                {isSubmitting ? "অপেক্ষা করুন..." : "পরিবর্তন করুন"}
              </button>
              {error && (
                <p className="text-center text-red-500 mt-2 text-[12px]">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-center text-green-500 mt-2 text-[12px]">
                  {success}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
