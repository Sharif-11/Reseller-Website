import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { register } from "../Api/auth.api";

const RegistrationInfo = ({ mobileNumber }: { mobileNumber: string }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const formik = useFormik({
    initialValues: {
      mobileNumber, // Read-only field
      name: "",
      zilla: "",
      address: "",
      email: "",
      sellerCode: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("নাম আবশ্যক"),
      zilla: Yup.string().required("জেলা আবশ্যক"),
      address: Yup.string().required("ঠিকানা আবশ্যক"),
      email: Yup.string().email("ইমেইল সঠিক নয়").optional(),
      sellerCode: Yup.string().optional(), // Optional field
      password: Yup.string()
        .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
        .required("পাসওয়ার্ড আবশ্যক"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "পাসওয়ার্ড মিলছে না")
        .required("পাসওয়ার্ড নিশ্চিত করুন"),
    }),
    onSubmit: async (values) => {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        confirmPassword: _,
        mobileNumber: mobileNo,
        ...otherData
      } = values;
      const { success, error } = await register({
        ...otherData,
        mobileNo,
      });
      if (success) {
        navigate("/login");
      }
      if (error) {
        setError(error);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594e] text-center mb-4 sm:mb-6">
          রেজিস্ট্রেশন তথ্য
        </h1>
        <form onSubmit={formik.handleSubmit}>
          {/* Mobile Number (Read-only) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              মোবাইল নম্বর*
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={formik.values.mobileNumber}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">নাম*</label>
            <input
              type="text"
              name="name"
              placeholder="আপনার নাম লিখুন"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          {/* Zilla */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              জেলা*
            </label>
            <input
              type="text"
              name="zilla"
              placeholder="আপনার জেলা লিখুন"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                formik.touched.zilla && formik.errors.zilla
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formik.values.zilla}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.zilla && formik.errors.zilla && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.zilla}</p>
            )}
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ঠিকানা*
            </label>
            <input
              type="text"
              name="address"
              placeholder="আপনার ঠিকানা লিখুন"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                formik.touched.address && formik.errors.address
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.address}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              type="email"
              name="email"
              placeholder="আপনার ইমেইল লিখুন (যদি থাকে)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Seller Code */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              সেলার কোড (ঐচ্ছিক)
            </label>
            <input
              type="text"
              name="sellerCode"
              placeholder="আপনার সেলার কোড লিখুন (যদি থাকে)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formik.values.sellerCode}
              onChange={formik.handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড*
            </label>
            <input
              type="password"
              name="password"
              placeholder="পাসওয়ার্ড দিন"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড নিশ্চিত করুন*
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-[#87594e] text-white font-medium py-3 rounded-lg transition ${
              formik.isSubmitting
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#a0685a]"
            }`}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "অপেক্ষা করুন..."
              : "রেজিস্ট্রেশন সম্পন্ন করুন"}
          </button>

          <p className="text-[red] font-bold text-center">{error}</p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationInfo;
