import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { forgotPassword } from "../Api/auth.api";

// Validation schema using Yup
const validationSchema = Yup.object({
  phoneNo: Yup.string()
    .required("ফোন নম্বর প্রয়োজন।")
    .matches(/^01\d{9}$/, "ফোন নম্বরটি সঠিক নয়।"),
});

const PasswordReset = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleSubmit = async (values: { phoneNo: string }) => {
    const { phoneNo } = values;
    const { success, message } = await forgotPassword({ phoneNo });
    if (success) {
      navigate("/login");
    } else {
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-lg my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594E] text-center mb-4 sm:mb-6">
          পাসওয়ার্ড রিসেট
        </h1>
        <p className="text-center text-gray-700 mb-4">
          পাসওয়ার্ড রিসেট করতে আপনার মোবাইল নম্বর দিন।
        </p>
        <Formik
          initialValues={{ phoneNo: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  মোবাইল নম্বর*
                </label>
                <Field
                  type="text"
                  name="phoneNo"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594E] focus:outline-none"
                  placeholder="আপনার মোবাইল নম্বর দিন"
                />
                <ErrorMessage
                  name="phoneNo"
                  component="div"
                  className="text-red-500 text-sm mt-2"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#87594E] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[#7a4a3e] transition"
              >
                {isSubmitting ? "অপেক্ষা করুন..." : "পাসওয়ার্ড রিসেট করুন"}
              </button>
              <p className="text-red-500 text-sm my-[3px] text-center">
                {error ? error : ""}
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PasswordReset;
