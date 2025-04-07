import { useFormik } from "formik";
import { useState } from "react";
import { FiUpload, FiDollarSign, FiPackage, FiMapPin, FiTruck, FiFilm } from "react-icons/fi";
import * as Yup from "yup";
import { addProduct } from "../Api/product.api";
import { districts } from "../utils/districts";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      name: Yup.string().required("পণ্যের নাম আবশ্যক"),
      image: Yup.mixed()
        .required("ছবি আপলোড আবশ্যক")
        .test("fileSize", "সর্বোচ্চ ৩MB", (value) =>
          value && value instanceof File ? value.size <= 3 * 1024 * 1024 : true
        )
        .test("fileType", "শুধু ছবি", (value) =>
          value && value instanceof File
            ? (value as File).type.startsWith("image/")
            : true
        ),
      category: Yup.string().max(48, "খুব দীর্ঘ").optional(),
      basePrice: Yup.number()
        .positive("ধনাত্মক সংখ্যা")
        .required("আবশ্যক"),
      stockSize: Yup.number()
        .min(0, "০ বা বেশি")
        .optional(),
      suggestedMaxPrice: Yup.number()
        .min(
          Yup.ref("basePrice"),
          "বেস মূল্যের সমান বা বেশি"
        )
        .optional(),
      description: Yup.string().max(512, "খুব দীর্ঘ").optional(),
      location: Yup.string().required("আবশ্যক"),
      deliveryChargeInside: Yup.number()
        .min(0, "০ বা বেশি")
        .required("আবশ্যক"),
      deliveryChargeOutside: Yup.number()
        .min(0, "০ বা বেশি")
        .required("আবশ্যক"),
      videoUrl: Yup.string().url("সঠিক লিংক").optional(),
    }),
    onSubmit: async (values) => {
      setError(null);
      try {
        const { success, message } = await addProduct({
          ...values,
          basePrice: Number(values.basePrice),
          stockSize: Number(values.stockSize),
          suggestedMaxPrice: Number(values.suggestedMaxPrice),
          deliveryChargeInside: Number(values.deliveryChargeInside),
          deliveryChargeOutside: Number(values.deliveryChargeOutside),
        });
        if (success) navigate("/products");
        else setError(message);
      } catch (err) {
        setError("ত্রুটি হয়েছে, আবার চেষ্টা করুন");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      formik.setFieldValue("image", file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fieldConfigs = [
    { key: "name" as const, label: "পণ্যের নাম", icon: <FiPackage />, type: "text" },
    { key: "image" as const, label: "পণ্যের ছবি", icon: <FiUpload />, type: "file" },
    { key: "category" as const, label: "ক্যাটাগরি", icon: <FiPackage />, type: "text" },
    { key: "basePrice" as const, label: "পাইকারি মূল্য", icon: <FiDollarSign />, type: "number" },
    { key: "stockSize" as const, label: "স্টক সাইজ", icon: <FiPackage />, type: "number" },
    { key: "suggestedMaxPrice" as const, label: "সর্বোচ্চ পাইকারি মূল্য", icon: <FiDollarSign />, type: "number" },
    { key: "description" as const, label: "বিবরণ", icon: <FiPackage />, type: "textarea" },
    { key: "location" as const, label: "লোকেশন", icon: <FiMapPin />, type: "select" },
    { key: "deliveryChargeInside" as const, label: "ভিতরের ডেলিভারি charge", icon: <FiTruck />, type: "number" },
    { key: "deliveryChargeOutside" as const, label: "বাইরের ডেলিভারি charge", icon: <FiTruck />, type: "number" },
    { key: "videoUrl" as const, label: "ভিডিও লিংক", icon: <FiFilm />, type: "text" },
  ];

  return (
    <div className="min-h-screen  p-0 sm:p-4 rounded-xl shadow-sm overflow-hidden">
      <div className="w-full max-w-3xl mx-auto bg-white shadow-none sm:shadow-sm sm:rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
          <h1 className="text-xl font-bold">নতুন পণ্য যোগ করুন</h1>
          <p className="text-indigo-100 text-xs mt-1">
            আপনার পণ্যের তথ্য প্রদান করুন
          </p>
        </div>

        {/* Form */}
        <div className="p-3 sm:p-6">
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-md text-xs">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {fieldConfigs.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "col-span-1" : ""}
                >
                  <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    {field.icon}
                    {field.label}
                    {formik.touched[field.key] && formik.errors[field.key] && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className={`w-full px-3 py-2 border rounded-lg text-xs ${
                        formik.touched[field.key] && formik.errors[field.key]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps(field.key)}
                    >
                      <option value="">জেলা নির্বাচন করুন</option>
                      {districts.map((district) => (
                        <option key={district.district} value={district.districtbn}>
                          {district.districtbn}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "file" ? (
                    <div>
                      <input
                        type="file"
                        className="hidden"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="image"
                        className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 mx-auto mb-1 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2">
                            <FiUpload className="text-xl text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              ছবি আপলোড করুন
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg text-xs ${
                        formik.touched[field.key] && formik.errors[field.key]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps(field.key)}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className={`w-full px-3 py-2 border rounded-lg text-xs ${
                        formik.touched[field.key] && formik.errors[field.key]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps(field.key)}
                    />
                  )}

                  {formik.touched[field.key] && formik.errors[field.key] && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {formik.errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formik.isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-white"
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
                    <span className="text-xs">যোগ করা হচ্ছে...</span>
                  </>
                ) : (
                  <span className="text-xs">পণ্য যোগ করুন</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;