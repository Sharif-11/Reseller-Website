import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import districts from "../../public/zillasInfo.json";
import { updateProfile } from "../Api/auth.api";
import { useAuth } from "../Hooks/useAuth";
import { omitEmptyStringKeys } from "../utils/omitEmptyStrings";

export interface ProfileInfo {
  name: string;
  email: string;
  shopName: string;
  zilla: string;
  upazilla: string;
  address: string;
  nomineePhone: string;
}

const Profile = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [upazillas, setUpazillas] = useState<string[]>([]);
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user?.zilla) {
      setUpazillas(districts[user.zilla as keyof typeof districts] || []);
    }
  }, [user?.zilla]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(48, "নামটি আরও ছোট হতে হবে।")
      .required("নাম প্রদান করা বাধ্যতামূলক"),
    email: Yup.string()
      .optional()
      .email("ইমেইলটি সঠিক নয়।"),
    shopName: Yup.string()
      .max(32, "দোকানের নাম আরও ছোট হতে হবে।")
      .required("দোকানের নাম প্রদান করা বাধ্যতামূলক"),
    zilla: Yup.string()
      .max(48, "জেলার নাম আরও ছোট হতে হবে।")
      .required("জেলা নির্বাচন করা বাধ্যতামূলক"),
    upazilla: Yup.string()
      .max(48, "উপজেলার নাম আরও ছোট হতে হবে।")
      .required("উপজেলা নির্বাচন করা বাধ্যতামূলক"),
    address: Yup.string()
      .max(255, "ঠিকানা আরও ছোট হতে হবে।")
      .required("ঠিকানা প্রদান করা বাধ্যতামূলক"),
    nomineePhone: Yup.string()
      .optional()
      .matches(/^01\d{9}$/, "নমিনির ফোন নম্বরটি সঠিক নয়।"),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      shopName: user?.shopName || "",
      zilla: user?.zilla || "",
      upazilla: user?.upazilla || "",
      address: user?.address || "",
      nomineePhone: user?.nomineePhone || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccessMessage(null);
      try {
        const result = await updateProfile(
          omitEmptyStringKeys(values) as ProfileInfo
        );
        if (result.success) {
          setUser(result.data);
          setSuccessMessage("প্রোফাইল সফলভাবে আপডেট হয়েছে");
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(result.message || "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে");
        }
      } catch (err) {
        setError("একটি অপ্রত্যাশিত ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
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
    <div className="w-full px-0 sm:px-4 py-4">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">প্রোফাইল আপডেট</h1>
              <p className="text-indigo-100 text-sm mt-1">
                আপনার তথ্য আপডেট করুন
              </p>
            </div>
            <div className="bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {/* Phone Number (Readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  value={user?.phoneNo}
                />
              </div>

              {/* Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("name")}
                  required
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Email - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ইমেইল
                </label>
                <input
                  type="email"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Shop Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  দোকানের নাম *
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.shopName && formik.errors.shopName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("shopName")}
                  required
                />
                {formik.touched.shopName && formik.errors.shopName && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.shopName}
                  </p>
                )}
              </div>

              {/* District - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  জেলা *
                </label>
                <select
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.zilla && formik.errors.zilla
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("zilla")}
                  onChange={handleZillaChange}
                  required
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {Object.keys(districts).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {formik.touched.zilla && formik.errors.zilla && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.zilla}
                  </p>
                )}
              </div>

              {/* Upazilla - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  উপজেলা *
                </label>
                <select
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.upazilla && formik.errors.upazilla
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("upazilla")}
                  disabled={!formik.values.zilla}
                  required
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

              {/* Nominee Phone - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নমিনির ফোন নম্বর
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.nomineePhone && formik.errors.nomineePhone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="01XXXXXXXXX"
                  {...formik.getFieldProps("nomineePhone")}
                />
                {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.nomineePhone}
                  </p>
                )}
              </div>

              {/* Address - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ঠিকানা *
                </label>
                <textarea
                  rows={3}
                  className={`w-full border rounded-lg px-4 py-3 ${
                    formik.touched.address && formik.errors.address
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  {...formik.getFieldProps("address")}
                  required
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    আপডেট হচ্ছে...
                  </span>
                ) : (
                  "প্রোফাইল আপডেট করুন"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;