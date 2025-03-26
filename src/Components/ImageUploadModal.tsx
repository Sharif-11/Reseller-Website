import { useFormik } from "formik";
import { useState } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner8 } from "react-icons/im";
import * as Yup from "yup";
import { uploadProductImages } from "../Api/product.api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: number | null;
}

const ImageUploadModal = ({ isOpen, onClose, selectedProduct }: ModalProps) => {
  const [images, setImages] = useState<File[]>([new File([], "")]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const formik = useFormik({
    initialValues: { images: [] as File[] },
    validationSchema: Yup.object({
      images: Yup.array()
        .min(1, "কমপক্ষে একটি ছবি আপলোড করুন।")
        .of(
          Yup.mixed()
            .test(
              "fileRequired",
              "ফাইল নির্বাচন করুন।",
              (value) => value instanceof File && value.name !== ""
            )
            .test(
              "fileSize",
              "ফাইল সাইজ খুব বড়। 3 এমবি এর কম হতে হবে।",
              (value) =>
                value && value instanceof File
                  ? value.size <= 3 * 1024 * 1024
                  : true
            )
            .test("fileType", "কেবল ছবি আপলোড করতে হবে।", (value) =>
              value && value instanceof File
                ? value.type.startsWith("image/")
                : true
            )
        ),
    }),
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setUploadProgress(0);
    
      try {
        if (values.images.every((img) => img instanceof File && img.name !== "")) {
          const result = await uploadProductImages(
            selectedProduct!,
            values.images,
            (progress) => {
              setUploadProgress(progress);
            }
          );
    
          if (result.success) {
            setSuccess("ছবি সফলভাবে আপলোড হয়েছে!");
            setTimeout(() => {
              onClose();
         // Trigger data reload
            }, 1500); // Show success message briefly before closing
          } else {
            setError(result.message || "আপলোড ব্যর্থ হয়েছে");
          }
        }
      } catch (err) {
        let errorMessage = "আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
        
        if (err instanceof Error) {
          errorMessage = err.message.includes("413")
            ? "ছবির সাইজ খুব বড়। সর্বোচ্চ ৩MB সাইজের ছবি আপলোড করতে পারবেন।"
            : err.message;
        }
    
        setError(errorMessage);
        setUploadProgress(0); // Reset progress on error
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedImages = [...images];
      updatedImages[index] = file;
      setImages(updatedImages);
      formik.setFieldValue("images", updatedImages);
    }
  };

  const addImageInput = () => {
    setImages([...images, new File([], "")]);
  };

  const removeImageInput = (index: number) => {
    if (images.length > 1) {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      formik.setFieldValue("images", updatedImages);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <AiOutlineClose size={20} />
        </button>
        
        <h2 className="text-xl font-semibold text-center mb-4">
          আরো ছবি যোগ করুন
        </h2>
        
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            {images.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="w-full border rounded-lg p-2 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    disabled={loading}
                  />
                  {formik.errors.images?.[index] && (
                    <p className="text-red-500 text-xs mt-1">
                      {typeof formik.errors.images?.[index] === "string" && formik.errors.images[index]}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImageInput(index)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                  disabled={loading}
                >
                  &times;
                </button>
              </div>
            ))}
            
            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={addImageInput}
                className="flex items-center gap-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                disabled={loading}
              >
                <AiOutlinePlus />
                আরো ছবি যোগ করুন
              </button>
              
              <button
                type="submit"
                className="flex items-center gap-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ImSpinner8 className="animate-spin" />
                    আপলোড হচ্ছে...
                  </>
                ) : (
                  "আপলোড করুন"
                )}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center py-2 animate-pulse">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;