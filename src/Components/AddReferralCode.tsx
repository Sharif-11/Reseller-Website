import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { addReferralCode } from "../Api/seller.api";
import { useAuth } from "../Hooks/useAuth";

const AddReferralCode = () => {
  const { setUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      referralCode: "",
    },
    validationSchema: Yup.object({
      referralCode: Yup.string()
        .trim()
        .min(3, "রেফারাল কোড আরও বড় হতে হবে।")
        .max(32, "রেফারাল কোড আরও ছোট হতে হবে।")
        .required("রেফারাল কোড প্রয়োজন।"),
    }),
    onSubmit: async (values) => {
      setError(null);
      setSuccessMessage(null);
      const result = await addReferralCode(values.referralCode);
      if (result.success) {
        setSuccessMessage("রেফারাল কোড সফলভাবে যোগ হয়েছে!");
        setUser(result?.data);
      } else {
        setError(result.message);
      }
    },
  });

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-gray-700 mb-4">
        রেফারাল কোড যোগ করুন
      </h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            রেফারাল কোড
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-3"
            {...formik.getFieldProps("referralCode")}
          />
          {formik.touched.referralCode && formik.errors.referralCode && (
            <p className="text-red-500 text-xs mt-1">
              {formik.errors.referralCode}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a]"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "অপেক্ষা করুন..." : "যোগ করুন"}
        </button>

        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-xs mt-2 text-center">
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddReferralCode;
