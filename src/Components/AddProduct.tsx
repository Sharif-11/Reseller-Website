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
        .test("fileSize", "ফাইল সাইজ 3MB এর কম হতে হবে", (value) =>
          value && value instanceof File ? value.size <= 3 * 1024 * 1024 : true
        )
        .test("fileType", "শুধুমাত্র ছবি ফাইল অনুমোদিত", (value) =>
          value && value instanceof File
            ? (value as File).type.startsWith("image/")
            : true
        ),
      category: Yup.string().max(48, "ক্যাটাগরি নাম খুব দীর্ঘ").optional(),
      basePrice: Yup.number()
        .positive("মূল্য ধনাত্মক হতে হবে")
        .required("পাইকারি মূল্য আবশ্যক"),
      stockSize: Yup.number()
        .min(0, "স্টক সাইজ ০ বা তার বেশি হতে হবে")
        .optional(),
      suggestedMaxPrice: Yup.number()
        .min(
          Yup.ref("basePrice"),
          "সর্বোচ্চ মূল্য বেস মূল্যের সমান বা বেশি হতে হবে"
        )
        .optional(),
      description: Yup.string().max(512, "বিবরণ খুব দীর্ঘ").optional(),
      location: Yup.string().required("লোকেশন নির্বাচন আবশ্যক"),
      deliveryChargeInside: Yup.number()
        .min(0, "ডেলিভারি চার্জ ০ বা তার বেশি হতে হবে")
        .required("ভিতরের ডেলিভারি চার্জ আবশ্যক"),
      deliveryChargeOutside: Yup.number()
        .min(0, "ডেলিভারি চার্জ ০ বা তার বেশি হতে হবে")
        .required("বাইরের ডেলিভারি চার্জ আবশ্যক"),
      videoUrl: Yup.string().url("সঠিক ভিডিও লিংক দিন").optional(),
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
        setError("একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      formik.setFieldValue("image", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fieldConfigs = [
    {
      key: "name",
      label: "পণ্যের নাম",
      icon: <FiPackage className="text-indigo-600" />,
      type: "text",
    },
    {
      key: "image",
      label: "পণ্যের ছবি",
      icon: <FiUpload className="text-indigo-600" />,
      type: "file",
    },
    {
      key: "category",
      label: "ক্যাটাগরি",
      icon: <FiPackage className="text-indigo-600" />,
      type: "text",
    },
    {
      key: "basePrice",
      label: "পাইকারি মূল্য",
      icon: <FiDollarSign className="text-indigo-600" />,
      type: "number",
    },
    {
      key: "stockSize",
      label: "স্টক সাইজ",
      icon: <FiPackage className="text-indigo-600" />,
      type: "number",
    },
    {
      key: "suggestedMaxPrice",
      label: "সর্বোচ্চ পাইকারি মূল্য",
      icon: <FiDollarSign className="text-indigo-600" />,
      type: "number",
    },
    {
      key: "description",
      label: "বিবরণ",
      icon: <FiPackage className="text-indigo-600" />,
      type: "textarea",
    },
    {
      key: "location",
      label: "লোকেশন",
      icon: <FiMapPin className="text-indigo-600" />,
      type: "select",
    },
    {
      key: "deliveryChargeInside",
      label: "ভিতরের ডেলিভারি চার্জ",
      icon: <FiTruck className="text-indigo-600" />,
      type: "number",
    },
    {
      key: "deliveryChargeOutside",
      label: "বাইরের ডেলিভারি চার্জ",
      icon: <FiTruck className="text-indigo-600" />,
      type: "number",
    },
    {
      key: "videoUrl",
      label: "ভিডিও লিংক",
      icon: <FiFilm className="text-indigo-600" />,
      type: "text",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4 ">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">নতুন পণ্য যোগ করুন</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            আপনার পণ্যের বিস্তারিত তথ্য প্রদান করুন
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {fieldConfigs.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    {field.icon}
                    {field.label}
                    {formik.touched[field.key as keyof typeof formik.initialValues] &&
                    formik.errors[field.key as keyof typeof formik.initialValues] ? (
                      <span className="text-red-500">*</span>
                    ) : null}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formik.touched[field.key as keyof typeof formik.values] && formik.errors[field.key as keyof typeof formik.values]
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
                        className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 mx-auto mb-2 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <FiUpload className="text-2xl text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                              ছবি আপলোড করুন
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formik.touched[field.key as keyof typeof formik.initialValues] && formik.errors[field.key as keyof typeof formik.initialValues]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps(field.key)}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formik.touched[field.key as keyof typeof formik.initialValues] && formik.errors[field.key as keyof typeof formik.initialValues]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps(field.key)}
                    />
                  )}

                  {formik.touched[field.key as keyof typeof formik.initialValues] && 
                   formik.errors[field.key as keyof typeof formik.initialValues] && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors[field.key as keyof typeof formik.initialValues]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formik.isSubmitting ? (
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
                    পণ্য যোগ করা হচ্ছে...
                  </>
                ) : (
                  "পণ্য যোগ করুন"
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