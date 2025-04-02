import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { updateProduct } from "../Api/product.api";
import { districts } from "../utils/districts";

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: () => void;
  initialData: {
    name: string;
    imageUrl: string;
    basePrice: string;
    category: string;
    stockSize: string;
    suggestedMaxPrice: string;
    description: string;
    location: string;
    deliveryChargeInside: string;
    deliveryChargeOutside: string;
    videoUrl: string;
  };
}

const ProductEditModal = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
  initialData
}: ProductEditModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const formik = useFormik({
    initialValues: initialData,
    validationSchema: Yup.object({
      name: Yup.string().required("নাম আবশ্যক।"),
      imageUrl: Yup.string().optional(), // For existing image
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
      try {
        const { success, message } = await updateProduct(productId, {
          ...values,
          image: selectedImage,
          basePrice: Number(values.basePrice),
          stockSize: Number(values.stockSize),
          suggestedMaxPrice: Number(values.suggestedMaxPrice),
          deliveryChargeInside: Number(values.deliveryChargeInside),
          deliveryChargeOutside: Number(values.deliveryChargeOutside),
        });

        if (success) {
          onSuccess();
        } else {
          setError(message);
        }
      } catch (err) {
        setError("আপডেট করতে সমস্যা হয়েছে");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#87594e]">পণ্য এডিট করুন</h1>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ছবি
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border rounded overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer">
                  <span className="px-3 py-2 bg-[#87594e] text-white rounded hover:bg-[#a0685a]">
                    ছবি পরিবর্তন
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              {formik.touched.imageUrl && formik.errors.imageUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.imageUrl}
                </p>
              )}
            </div>

            {/* Form Fields */}
            {Object.keys(formik.initialValues)
              .filter(key => key !== 'imageUrl')
              .map((key) => (
                <div key={key}>
                  <label className="block text-gray-700 font-medium mb-2">
                    {key === "name" && "পণ্যের নাম"}
                    {key === "category" && "ক্যাটাগরি"}
                    {key === "basePrice" && "পাইকারি মূল্য"}
                    {key === "stockSize" && "স্টক সাইজ"}
                    {key === "suggestedMaxPrice" && "সর্বোচ্চ বিক্রয়ের সম্ভাব্য মূল্য"}
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
                        <option 
                          key={district.district} 
                          value={district.districtbn}
                          selected={district.districtbn === formik.values.location}
                        >
                          {district.districtbn}
                        </option>
                      ))}
                    </select>
                  ) : key === "description" ? (
                    <textarea
                      className="w-full border rounded-lg p-3"
                      rows={16}
                      {...formik.getFieldProps(key)}
                    />
                  ) : (
                    <input
                      type={key.includes("Price") || key.includes("Charge") ? "number" : "text"}
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

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                disabled={formik.isSubmitting}
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#87594e] text-white rounded hover:bg-[#a0685a] disabled:bg-gray-400"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;