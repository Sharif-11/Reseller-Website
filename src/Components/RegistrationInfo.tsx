import { useFormik } from "formik";
import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiShoppingBag, FiMapPin, FiPhone, FiMail, FiLock } from "react-icons/fi";
import * as Yup from "yup";
import districts from "../../public/zillasInfo.json";
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
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(48, "নামটি আরও ছোট হতে হবে")
      .required("নাম আবশ্যক"),
    email: Yup.string().optional().email("সঠিক ইমেইল দিন"),
    shopName: Yup.string()
      .max(32, "দোকানের নাম আরও ছোট হতে হবে")
      .required("দোকানের নাম আবশ্যক"),
    zilla: Yup.string()
      .required("জেলা নির্বাচন করুন")
      .max(48, "জেলার নাম আরও ছোট হতে হবে"),
    upazilla: Yup.string()
      .required("উপজেলা নির্বাচন করুন")
      .max(48, "উপজেলার নাম আরও ছোট হতে হবে"),
    address: Yup.string()
      .max(255, "ঠিকানা আরও ছোট হতে হবে")
      .required("ঠিকানা আবশ্যক"),
    nomineePhone: Yup.string()
      .optional()
      .matches(/^01\d{9}$/, "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"),
    password: Yup.string()
      .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
      .required("পাসওয়ার্ড আবশ্যক"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "পাসওয়ার্ড মেলেনি")
      .required("পাসওয়ার্ড নিশ্চিত করুন"),
    referralCode: Yup.string()
      .optional()
      .matches(
        /^[a-zA-Z0-9-_]+$/,
        "শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) ব্যবহার করুন"
      )
      .min(3, "অন্তত ৩ অক্ষর হতে হবে")
      .max(16, "১৬ অক্ষরের বেশি হতে পারবে না"),
  });

  const formik = useFormik({
    initialValues: {
      phoneNo: mobileNumber,
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
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setIsLoading(true);
      try {
        const { confirmPassword, ...payload } = values;
        const registrationData = omitEmptyStringKeys(payload) as RegisterInfo;
        const { success, message } = await register(registrationData);

        if (success) {
          navigate("/login");
        } else {
          setError(message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
        }
      } catch (error) {
        setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", "");
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">রেজিস্ট্রেশন সম্পন্ন করুন</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            আপনার তথ্য প্রদান করে রেজিস্ট্রেশন সম্পন্ন করুন
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="grid md:grid-cols-2 gap-4">
            {/* Phone Number (Readonly) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiPhone />
                মোবাইল নম্বর *
              </label>
              <input
                type="text"
                value={formik.values.phoneNo}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiUser />
                আপনার নাম *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.name && formik.errors.name ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("name")}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiMail />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiShoppingBag />
                দোকানের নাম *
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.shopName && formik.errors.shopName ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("shopName")}
              />
              {formik.touched.shopName && formik.errors.shopName && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.shopName}</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                রেফারাল কোড (ঐচ্ছিক)
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.values.referralCode ? "bg-gray-50" : ""
                } ${
                  formik.touched.referralCode && formik.errors.referralCode ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("referralCode")}
                readOnly={!!referralCode}
              />
              {formik.touched.referralCode && formik.errors.referralCode && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.referralCode}</p>
              )}
            </div>

            {/* Empty div for grid alignment */}
            <div></div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiMapPin />
                জেলা *
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.zilla && formik.errors.zilla ? "border-red-500" : "border-gray-300"
                }`}
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

            {/* Upazilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                উপজেলা *
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.upazilla && formik.errors.upazilla ? "border-red-500" : "border-gray-300"
                }`}
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
                <p className="text-red-500 text-xs mt-1">{formik.errors.upazilla}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ঠিকানা *
              </label>
              <textarea
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.address && formik.errors.address ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("address")}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.address}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiLock />
                পাসওয়ার্ড *
              </label>
              <input
                type="password"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন *
              </label>
              <input
                type="password"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("confirmPassword")}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Nominee Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                নমিনির ফোন নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.nomineePhone && formik.errors.nomineePhone ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("nomineePhone")}
              />
              {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.nomineePhone}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading || !formik.isValid}
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
                    রেজিস্ট্রেশন করা হচ্ছে...
                  </>
                ) : (
                  "রেজিস্ট্রেশন সম্পন্ন করুন"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationInfo;