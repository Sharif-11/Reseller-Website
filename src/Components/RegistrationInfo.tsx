import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import districts from "../../public/zillasInfo.json"; // Importing the JSON
import { register, RegisterInfo } from "../Api/auth.api";
import { omitEmptyStringKeys } from "../utils/omitEmptyStrings";

const RegistrationInfo = ({
  mobileNumber,
  referralCode,
}: {
  mobileNumber: string;
  referralCode: string | null;
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [upazillas, setUpazillas] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      phoneNo: mobileNumber, // Read-only field
      name: "Shariful Islam",
      email: "",
      shopName: "Hello Bd",
      zilla: "",
      upazilla: "",
      address: "nazirhat",
      nomineePhone: "",
      password: "123456",
      confirmPassword: "123456",
      referralCode: referralCode || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(48, "নামটি আরও ছোট হতে হবে।")
        .required("নাম আবশ্যক"),
      email: Yup.string().optional().email("ইমেইলটি সঠিক নয়"),
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
        .optional()
        .matches(/^01\d{9}$/, "নমিনির ফোন নম্বরটি সঠিক নয়।"),
      password: Yup.string()
        .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
        .max(16, "পাসওয়ার্ডটি আরও ছোট হতে হবে।")
        .required("পাসওয়ার্ড আবশ্যক"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "পাসওয়ার্ড মেলেনি")
        .required("পাসওয়ার্ড নিশ্চিত করা আবশ্যক"),
      referralCode: Yup.string()
        .optional()
        .matches(
          /^[a-zA-Z0-9-_]+$/,
          "রেফারাল কোডটি শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) থাকতে পারে।"
        )
        .min(3, "রেফারাল কোডটি অন্তত ৩ অক্ষরের হতে হবে।")
        .max(16, "রেফারাল কোডটি ১৬ অক্ষরের বেশি হতে পারবে না।"),
    }),
    onSubmit: async (values) => {
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = values; // Excluding confirmPassword only
      // check whether optional value is empty or not
      const registrationData = omitEmptyStringKeys(payload) as RegisterInfo;
      // alert(JSON.stringify(registrationData));
      const { success, message } = await register(registrationData);

      if (success) navigate("/login");
      else setError(message);
    },
  });

  // Handle Zilla Selection
  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts; // Type assertion here
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", ""); // Reset upazilla when zilla changes

    // Update the upazillas based on the selected zilla
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 my-16">
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
              placeholder="আপনার নাম লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              type="email"
              placeholder="আপনার ইমেইল লিখুন"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Shop Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              দোকানের নাম*
            </label>
            <input
              type="text"
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
          {/* Referral Code */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              রেফারাল কোড (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="রেফারাল কোড লিখুন"
              className={
                formik.values.referralCode && formik.values.referralCode !== ""
                  ? "w-full border rounded-lg p-3 bg-gray-100 focus:outline-none"
                  : "w-full border rounded-lg p-3"
              }
              {...formik.getFieldProps("referralCode")}
              readOnly={Boolean(
                referralCode && referralCode !== ""
              )}
            />
            {formik.touched.referralCode && formik.errors.referralCode && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.referralCode}
              </p>
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
              উপজেলা/থানা*
            </label>
            <select
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
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ঠিকানা*
            </label>
            <textarea
              placeholder="আপনার ঠিকানা লিখুন"
              className="w-full border rounded-lg p-3 resize-none"
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.address}
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

          {/* Nominee Phone Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              নমিনির ফোন নম্বর (ঐচ্ছিক)
            </label>
            <input
              type="text"
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
          <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationInfo;
