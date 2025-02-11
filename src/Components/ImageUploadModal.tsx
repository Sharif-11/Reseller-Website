import { useFormik } from "formik";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import * as Yup from "yup";
import { uploadProductImages } from "../Api/product.api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: number | null;
}

const ImageUploadModal = ({ isOpen, onClose, selectedProduct }: ModalProps) => {
  // Ensure at least one input exists initially
  const [images, setImages] = useState<File[]>([new File([], "")]);
  const [error, setError] = useState<string | null>(null);
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
      if (
        values.images.every((img) => img instanceof File && img.name !== "")
      ) {
        const result = await uploadProductImages(
          selectedProduct!,
          values.images
        );
        if (result.success) {
          onClose();
        } else {
          setError(result.message);
        }
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

  return (
    isOpen && (
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-lg w-96 shadow-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-lg"
          >
            <AiOutlineClose />
          </button>
          <h2 className="text-xl font-semibold text-center mb-4">
            আরো ছবি যোগ করুন
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {images.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="w-full border rounded-lg p-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                  {formik.errors.images &&
                    typeof formik.errors.images === "string" && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.images}
                      </p>
                    )}
                </div>
              ))}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={addImageInput}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400"
                >
                  আরো ছবি যোগ করুন
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400"
                >
                  আপলোড করুন
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default ImageUploadModal;
