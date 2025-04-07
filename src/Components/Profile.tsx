import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FiUser, FiShoppingBag, FiMapPin, FiPhone, FiMail, FiSave } from "react-icons/fi";
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
      .max(48, "নামটি আরও ছোট হতে হবে")
      .required("নাম আবশ্যক"),
    email: Yup.string()
      .optional()
      .email("সঠিক ইমেইল দিন"),
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
        setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
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
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">প্রোফাইল আপডেট</h1>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                আপনার ব্যক্তিগত তথ্য আপডেট করুন
              </p>
            </div>
            <div className="bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Phone (Readonly) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiPhone />
                ফোন নম্বর
              </label>
              <input
                type="text"
                readOnly
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm"
                value={user?.phoneNo}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiUser />
                আপনার নাম *
              </label>
              <input
                type="text"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("name")}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiMail />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type="email"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
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

            {/* Shop Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiShoppingBag />
                দোকানের নাম *
              </label>
              <input
                type="text"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.shopName && formik.errors.shopName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("shopName")}
              />
              {formik.touched.shopName && formik.errors.shopName && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.shopName}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiMapPin />
                জেলা *
              </label>
              <select
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.zilla && formik.errors.zilla
                    ? "border-red-500"
                    : "border-gray-300"
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
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.zilla}
                </p>
              )}
            </div>

            {/* Upazilla */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                উপজেলা *
              </label>
              <select
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.upazilla && formik.errors.upazilla
                    ? "border-red-500"
                    : "border-gray-300"
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
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.upazilla}
                </p>
              )}
            </div>

            {/* Nominee Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiPhone />
                নমিনির ফোন নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.nomineePhone && formik.errors.nomineePhone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("nomineePhone")}
              />
              {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.nomineePhone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                ঠিকানা *
              </label>
              <textarea
                rows={3}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm ${
                  formik.touched.address && formik.errors.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                {...formik.getFieldProps("address")}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.address}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!formik.isValid || formik.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {formik.isSubmitting ? "আপডেট হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;