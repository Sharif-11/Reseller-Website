/* eslint-disable @typescript-eslint/no-unused-vars */
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import districts from "../../public/zillasInfo.json"; // Importing the JSON
import { register } from "../Api/auth.api";

const RegistrationInfo = ({ mobileNumber }: { mobileNumber: string }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [upazillas, setUpazillas] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      phoneNo: mobileNumber, // Read-only field
      name: "",
      email: "",
      shopName: "",
      zilla: "",
      upazilla: "",
      address: "",
      nomineePhone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(48, "নামটি আরও ছোট হতে হবে।")
        .required("নাম আবশ্যক"),
      email: Yup.string().email("ইমেইলটি সঠিক নয়").optional(),
      shopName: Yup.string()
        .max(32, "দোকানের নাম আরও ছোট হতে হবে।")
        .required("দোকানের নাম আবশ্যক"),
      zilla: Yup.string()
        .required("জেলা আবশ্যক")
        .max(48, "জেলার নাম আরও ছোট হতে হবে।"),
      upazilla: Yup.string()
        .required("উপজেলা আবশ্যক")
        .max(48, "উপজেলার নাম আরও ছোট হতে হবে।"),
      address: Yup.string()
        .max(255, "ঠিকানা আরও ছোট হতে হবে।")
        .required("ঠিকানা আবশ্যক"),
      nomineePhone: Yup.string()
        .matches(/^01\d{9}$/, "নমিনির ফোন নম্বরটি সঠিক নয়।")
        .optional(),
      password: Yup.string()
        .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
        .max(16, "পাসওয়ার্ডটি আরও ছোট হতে হবে।")
        .required("পাসওয়ার্ড আবশ্যক"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "পাসওয়ার্ড মেলেনি")
        .required("পাসওয়ার্ড নিশ্চিত করা আবশ্যক"),
    }),
    onSubmit: async (values) => {
      setError(null);
      const { phoneNo, confirmPassword, ...otherData } = values;
      const { success, message } = await register({ ...otherData, phoneNo });
      if (success) navigate("/login");
      else setError(message);
    },
  });

  // Handle Zilla Selection
  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", ""); // Reset upazilla when zilla changes

    // Update the upazillas based on the selected zilla
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold text-[#87594e] text-center mb-4">
          রেজিস্ট্রেশন তথ্য
        </h1>
        <form onSubmit={formik.handleSubmit}>
          {/* Phone Number (Read-only) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              মোবাইল নম্বর*
            </label>
            <input
              type="text"
              name="phoneNo"
              value={formik.values.phoneNo}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              আপনার নাম*
            </label>
            <input
              type="text"
              name="name"
              placeholder="আপনার নাম লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
            )}
          </div>

          {/* Shop Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              দোকানের নাম*
            </label>
            <input
              type="text"
              name="shopName"
              placeholder="দোকানের নাম লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("shopName")}
            />
            {formik.touched.shopName && formik.errors.shopName && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.shopName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ইমেইল
            </label>
            <input
              type="email"
              name="email"
              placeholder="আপনার ইমেইল লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Zilla Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              জেলা*
            </label>
            <select
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("zilla")}
              onChange={handleZillaChange}
            >
              <option value="">জেলা নির্বাচন করুন</option>
              {Object.keys(districts).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {formik.touched.zilla && formik.errors.zilla && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.zilla}</p>
            )}
          </div>

          {/* Upazilla Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              উপজেলা*
            </label>
            <select
              name="upazilla"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("upazilla")}
              disabled={!formik.values.zilla}
            >
              <option value="">উপজেলা নির্বাচন করুন</option>
              {upazillas.map((upazilla) => (
                <option key={upazilla} value={upazilla}>
                  {upazilla}
                </option>
              ))}
            </select>
            {formik.touched.upazilla && formik.errors.upazilla && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.upazilla}
              </p>
            )}
          </div>

          {/* Address */}
          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ঠিকানা*
            </label>
            <textarea
              name="address"
              placeholder="আপনার ঠিকানা লিখুন"
              className="w-full border rounded-lg p-3 resize-none" // Added resize-none to prevent resizing
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.address}
              </p>
            )}
          </div>

          {/* Nominee Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              নমিনির ফোন নম্বর
            </label>
            <input
              type="text"
              name="nomineePhone"
              placeholder="নমিনির ফোন নম্বর লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("nomineePhone")}
            />
            {formik.touched.nomineePhone && formik.errors.nomineePhone && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.nomineePhone}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড*
            </label>
            <input
              type="password"
              name="password"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড নিশ্চিত করুন*
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("confirmPassword")}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "অপেক্ষা করুন..."
              : "রেজিস্ট্রেশন সম্পন্ন করুন"}
          </button>

          {/* API Error Message */}
          {error && (
            <p className="text-red-500 text-xs font-bold text-center mt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationInfo;
