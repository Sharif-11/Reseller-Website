import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { login } from "../Api/auth.api";
import { UserContext } from "../Context/userContext";

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext is null");
  }
  const { setUser } = userContext;
  const navigate = useNavigate();
  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .matches(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন")
      .required("মোবাইল নম্বর প্রয়োজন"),
    password: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
      .required("পাসওয়ার্ড প্রয়োজন"),
  });

  const handleLogin = async (values: {
    mobileNumber: string;
    password: string;
  }) => {
    const { mobileNumber, password } = values;
    const { success, error, data } = await login({
      mobileNo: mobileNumber,
      password,
    });
    if (success) {
      localStorage.setItem("token", data?.accessToken);
      setUser(data?.user);
      navigate("/");
    }
    if (error) {
      setError(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(135,89,78)] text-center mb-4 sm:mb-6">
          লগইন করুন
        </h1>
        <Formik
          initialValues={{ mobileNumber: "01776775495", password: "123456" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Mobile Number */}
              <div className="mb-4">
                <label
                  htmlFor="mobileNumber"
                  className="block text-gray-700 font-medium mb-2"
                >
                  মোবাইল নম্বর*
                </label>
                <Field
                  id="mobileNumber"
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

              {/* Password */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  পাসওয়ার্ড*
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
                />
                <ErrorMessage
                  name="password"
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
                {isSubmitting ? "প্রসেসিং..." : "লগইন করুন"}
              </button>
              <p className="text-center text-[red]">{error}</p>
            </Form>
          )}
        </Formik>

        {/* Additional Options */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            নতুন ব্যবহারকারী?{" "}
            <a
              href="/register"
              className="text-[rgb(135,89,78)] font-medium hover:underline"
            >
              এখানে নিবন্ধন করুন
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            পাসওয়ার্ড ভুলে গেছেন?{" "}
            <a
              href="/forgot-password"
              className="text-[rgb(135,89,78)] font-medium hover:underline"
            >
              পাসওয়ার্ড পুনরুদ্ধার করুন
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
