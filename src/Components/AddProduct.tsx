import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { addProduct } from "../Api/product.api";
import { districts } from "../utils/districts";

const AddProduct = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      image: null,
      category: "",
      basePrice: "",
      stockSize: "",
      suggestedMaxPrice: "",
      description: "",
      location: "",
      deliveryChargeInside: "",
      deliveryChargeOutside: "",
      videoUrl: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("নাম আবশ্যক।"),
      image: Yup.mixed()
        .required("ছবি আপলোড আবশ্যক।")
        .test("fileSize", "ফাইল সাইজ খুব বড়। 3 এমবি এর কম হতে হবে।", (value) =>
          value && value instanceof File ? value.size <= 3 * 1024 * 1024 : true
        )
        .test("fileType", "কেবল ছবি  আপলোড করতে হবে।", (value) =>
          value && value instanceof File
            ? (value as File).type.startsWith("image/")
            : true
        ),
      category: Yup.string().max(48, "ক্যাটাগরি আরও ছোট হতে হবে।").optional(),
      basePrice: Yup.number()
        .positive("মূল্য সঠিক হতে হবে।")
        .required("মূল্য আবশ্যক।"),
      stockSize: Yup.number()
        .min(0, "স্টক সাইজ অবশ্যই সঠিক হতে হবে।")
        .optional(),
      suggestedMaxPrice: Yup.number()
        .min(
          Yup.ref("basePrice"),
          "প্রস্তাবিত সর্বোচ্চ মূল্য, base price এর সমান বা বড় হতে হবে।"
        )
        .optional(),
      description: Yup.string().max(512, "বিবরণ আরও ছোট হতে হবে।").optional(),
      location: Yup.string().required("লোকেশন সঠিক হতে হবে।"),
      deliveryChargeInside: Yup.number()
        .min(0, "inside ডেলিভারি চার্জ সঠিক হতে হবে।")
        .required("inside ডেলিভারি চার্জ আবশ্যক।"),
      deliveryChargeOutside: Yup.number()
        .min(0, "outside ডেলিভারি চার্জ সঠিক হতে হবে।")
        .required("outside ডেলিভারি চার্জ আবশ্যক।"),
      videoUrl: Yup.string().url("ভিডিও ইউআরএল সঠিক হতে হবে.").optional(),
    }),
    onSubmit: async (values) => {
      setError(null);
      const { success, message } = await addProduct(values);
      if (success) navigate("/products");
      else setError(message);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 my-16">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold text-[#87594e] text-center mb-4">
          পণ্য যোগ করুন
        </h1>
        <form onSubmit={formik.handleSubmit}>
          {Object.keys(formik.initialValues).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-gray-700 font-medium mb-2">
                {key === "name" && "পণ্যের নাম"}
                {key === "image" && "ছবি"}
                {key === "category" && "ক্যাটাগরি"}
                {key === "basePrice" && "মূল্য"}
                {key === "stockSize" && "স্টক সাইজ"}
                {key === "suggestedMaxPrice" && "প্রস্তাবিত সর্বোচ্চ মূল্য"}
                {key === "description" && "বিবরণ"}
                {key === "location" && "লোকেশন"}
                {key === "deliveryChargeInside" && "inside ডেলিভারি চার্জ"}
                {key === "deliveryChargeOutside" && "outside ডেলিভারি চার্জ"}
                {key === "videoUrl" && "ভিডিও ইউআরএল"}
              </label>

              {key === "location" ? (
                <select
                  className="w-full border rounded-lg p-3"
                  {...formik.getFieldProps(key)}
                >
                  <option value="">একটি জেলা নির্বাচন করুন</option>
                  {districts.map((district) => (
                    <option key={district.district} value={district.districtbn}>
                      {district.districtbn}
                    </option>
                  ))}
                </select>
              ) : key === "image" ? (
                <input
                  type="file"
                  className="w-full border rounded-lg p-3"
                  onChange={(e) =>
                    formik.setFieldValue("image", e.target.files![0])
                  }
                />
              ) : key === "description" ? (
                <textarea
                  className="w-full border rounded-lg p-3"
                  rows={4} // Making it a larger textarea
                  {...formik.getFieldProps(key)}
                />
              ) : (
                <input
                  type="text"
                  className="w-full border rounded-lg p-3"
                  {...formik.getFieldProps(key)}
                />
              )}

              {formik.touched[key as keyof typeof formik.initialValues] &&
                formik.errors[key as keyof typeof formik.initialValues] && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors[key as keyof typeof formik.initialValues]}
                  </p>
                )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "অপেক্ষা করুন..." : "পণ্য যোগ করুন"}
          </button>
          <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
