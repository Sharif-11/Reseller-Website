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
    validationSchema: Yup.object({
      name: Yup.string().max(48, "নামটি আরও ছোট হতে হবে।"),
      email: Yup.string().optional().email("ইমেইলটি সঠিক নয়।"),
      shopName: Yup.string().max(32, "দোকানের নাম আরও ছোট হতে হবে।"),
      zilla: Yup.string().max(48, "জেলার নাম আরও ছোট হতে হবে।"),
      upazilla: Yup.string().max(48, "উপজেলার নাম আরও ছোট হতে হবে।"),
      address: Yup.string().max(255, "ঠিকানা আরও ছোট হতে হবে।"),
      nomineePhone: Yup.string()
        .optional()
        .matches(/^01\d{9}$/, "নমিনির ফোন নম্বরটি সঠিক নয়।"),
    }),
    onSubmit: async (values) => {
      setError(null);
      setSuccessMessage(null);
      const result = await updateProfile(
        omitEmptyStringKeys(values) as ProfileInfo
      );
      const { success, message } = result;
      const data = result?.data;
      if (success) {
        // alert(JSON.stringify(data));
        setUser(data);
        setSuccessMessage("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
      } else {
        setError(message);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 my-3">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-xl font-bold text-[#87594e] text-center mb-4">
          প্রোফাইল আপডেট করুন
        </h1>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              আপনার নাম
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ইমেইল
            </label>
            <input
              type="email"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">জেলা</label>
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

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              উপজেলা
            </label>
            <select
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("upazilla")}
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

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              দোকানের নাম
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("shopName")}
            />
            {formik.touched.shopName && formik.errors.shopName && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.shopName}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              নমিনির ফোন নম্বর
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-3"
              {...formik.getFieldProps("nomineePhone")}
            />
            {formik.touched.nomineePhone && formik.errors.nomineePhone && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.nomineePhone}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ঠিকানা
            </label>
            <textarea
              className="w-full border rounded-lg p-3 resize-none"
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.address}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a]"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "অপেক্ষা করুন..." : "প্রোফাইল আপডেট করুন"}
          </button>
          {error && (
            <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
          )}
          {successMessage && (
            <div className="text-green-500 text-xs mt-2 text-center">
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
