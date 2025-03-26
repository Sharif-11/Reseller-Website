import { useFormik } from "formik";
import { useState, useRef, useEffect } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner8 } from "react-icons/im";
import * as Yup from "yup";
import { uploadProductImages } from "../Api/product.api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: number | null;
}

interface ImageWithPreview {
  file: File;
  preview: string;
}

const ImageUploadModal = ({ isOpen, onClose, selectedProduct }: ModalProps) => {
  const [images, setImages] = useState<ImageWithPreview[]>([
    { file: new File([], ""), preview: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

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
            }, 1500);
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
        setUploadProgress(0);
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
      // Revoke previous object URL if exists
      if (images[index].preview) {
        URL.revokeObjectURL(images[index].preview);
      }

      const preview = URL.createObjectURL(file);
      const updatedImages = [...images];
      updatedImages[index] = { file, preview };
      setImages(updatedImages);
      formik.setFieldValue("images", updatedImages.map(img => img.file));
    }
  };

  const addImageInput = () => {
    setImages([...images, { file: new File([], ""), preview: "" }]);
  };

  const removeImageInput = (index: number) => {
    if (images.length > 1) {
      // Revoke the object URL to avoid memory leaks
      if (images[index].preview) {
        URL.revokeObjectURL(images[index].preview);
      }
      
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      formik.setFieldValue("images", updatedImages.map(img => img.file));
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center transition-opacity duration-300 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
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
            {images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, index)}
                      className="hidden"
                      ref={el => fileInputRefs.current[index] = el}
                      disabled={loading}
                    />
                    
                    {image.preview ? (
                      <div className="relative group">
                        <div className="flex justify-center items-center bg-gray-100 rounded-lg p-2">
                          <img
                            src={image.preview}
                            alt={`Preview ${index}`}
                            className="max-h-64 max-w-full object-contain rounded-lg"
                            style={{ maxHeight: '256px' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerFileInput(index)}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 opacity-0 group-hover:opacity-100 text-white"
                        >
                          <span className="bg-black bg-opacity-70 px-3 py-1 rounded">
                            Change Image
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerFileInput(index)}
                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                      >
                        <AiOutlinePlus size={32} />
                        <span className="mt-2 text-sm">Select Image</span>
                      </button>
                    )}
                    
                    {formik.errors.images?.[index] && (
                      <p className="text-red-500 text-xs mt-1">
                        {typeof formik.errors.images?.[index] === "string" && formik.errors.images[index]}
                      </p>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageInput(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 mt-2"
                      disabled={loading}
                    >
                      <AiOutlineClose size={18} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {image.file.name || "No file selected"}
                </div>
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
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
  <button
    type="button"
    onClick={addImageInput}
    className="flex items-center justify-center gap-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors w-full sm:w-auto"
    disabled={loading || images.length >= 5}
  >
    <AiOutlinePlus />
    <span className="whitespace-nowrap">
      আরো ছবি যোগ করুন <span className="hidden sm:inline">(সর্বোচ্চ ৫টি)</span>
    </span>
  </button>
  
  <button
    type="submit"
    className="flex items-center justify-center gap-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors w-full sm:w-auto"
    disabled={loading}
  >
    {loading ? (
      <>
        <ImSpinner8 className="animate-spin" />
        <span className="whitespace-nowrap">আপলোড হচ্ছে...</span>
      </>
    ) : (
      <span className="whitespace-nowrap">আপলোড করুন</span>
    )}
  </button>
</div>
            
            {error && (
              <p className="text-red-500 text-sm text-center py-2">
                {error}
              </p>
            )}
            
            {success && (
              <p className="text-green-500 text-sm text-center py-2">
                {success}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;