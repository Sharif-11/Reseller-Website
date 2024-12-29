import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { verifyOtp } from "../Api/otp.api";

const OTPValidation = ({
  mobileNumber,
  setPage,
}: {
  mobileNumber: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [error, setError] = useState<string | null>(null);
  // Yup validation schema
  const validationSchema = Yup.object({
    otp: Yup.string()
      .length(6, "OTP must be exactly 6 digits")
      .matches(/^\d+$/, "OTP must only contain digits")
      .required("OTP is required"),
  });

  // Handle form submission
  const handleSubmit = async (values: { otp: string }) => {
    const { otp } = values;
    const { success, error } = await verifyOtp(mobileNumber, otp);
    if (success) {
      setPage(2);
    }
    if (error) {
      setError(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594e] text-center mb-4 sm:mb-6">
          OTP ভেরিফিকেশন
        </h1>

        <Formik
          initialValues={{ otp: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* OTP Input */}
              <div className="mb-4">
                <label
                  htmlFor="otp"
                  className="block text-gray-700 font-medium mb-2"
                >
                  OTP দিন
                </label>
                <Field
                  type="text"
                  name="otp"
                  id="otp"
                  placeholder="6 ডিজিটের OTP"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
                />
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a] transition"
              >
                {isSubmitting ? "Validating..." : "OTP যাচাই করুন"}
              </button>
              <p className="text-[red] text-center">{error}</p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OTPValidation;
