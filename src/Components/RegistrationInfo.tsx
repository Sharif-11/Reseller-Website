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
      phoneNo: mobileNumber, // Read-only field
      name: "",
      password: "",
      email: "",
      shopName: "",
      zilla: "",
      upazilla: "",
      address: "",
      nomineePhone: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(48, "নামটি আরও ছোট হতে হবে।")
        .required("নাম আবশ্যক"),
      password: Yup.string()
        .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
        .max(16, "পাসওয়ার্ডটি আরও ছোট হতে হবে।")
        .required("পাসওয়ার্ড আবশ্যক"),
      email: Yup.string().email("ইমেইলটি সঠিক নয়").optional(),
      shopName: Yup.string()
        .max(32, "দোকানের নাম আরও ছোট হতে হবে।")
        .required("দোকানের নাম আবশ্যক"),
      zilla: Yup.string()
        .max(48, "জেলার নাম আরও ছোট হতে হবে।")
        .required("জেলা আবশ্যক"),
      upazilla: Yup.string()
        .max(48, "উপজেলার নাম আরও ছোট হতে হবে।")
        .required("উপজেলা আবশ্যক"),
      address: Yup.string()
        .max(255, "ঠিকানা আরও ছোট হতে হবে।")
        .required("ঠিকানা আবশ্যক"),
      nomineePhone: Yup.string()
        .matches(/^01\d{9}$/, "নমিনির ফোন নম্বরটি সঠিক নয়।")
        .optional(),
    }),
    onSubmit: async (values) => {
      const { phoneNo, ...otherData } = values;
      const { success, error } = await register({ ...otherData, phoneNo });
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

          {Object.keys(formik.initialValues).map((key) =>
            key !== "phoneNo" ? (
              <div className="mb-4" key={key}>
                <label className="block text-gray-700 font-medium mb-2">
                  {key === "password"
                    ? "পাসওয়ার্ড*"
                    : key === "confirmPassword"
                    ? "পাসওয়ার্ড নিশ্চিত করুন*"
                    : key === "email"
                    ? "ইমেইল (ঐচ্ছিক)"
                    : key === "shopName"
                    ? "দোকানের নাম*"
                    : key === "zilla"
                    ? "জেলা*"
                    : key === "upazilla"
                    ? "উপজেলা*"
                    : key === "address"
                    ? "ঠিকানা*"
                    : key === "nomineePhone"
                    ? "নমিনির ফোন নম্বর (ঐচ্ছিক)"
                    : "নাম*"}
                </label>
                <input
                  type={key.includes("password") ? "password" : "text"}
                  name={key}
                  placeholder={`আপনার ${key} লিখুন`}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none ${
                    formik.touched[key as keyof typeof formik.values] &&
                    formik.errors[key as keyof typeof formik.values]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formik.values[key as keyof typeof formik.values]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched[key as keyof typeof formik.values] &&
                  formik.errors[key as keyof typeof formik.values] && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors[key as keyof typeof formik.values]}
                    </p>
                  )}
              </div>
            ) : null
          )}

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
