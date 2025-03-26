import { useState } from "react";
import useAdminProducts from "../Hooks/useAdminProducts";
import ImageUploadModal from "./ImageUploadModal";
import Loading from "./Loading";
import { publishProduct } from "../Api/product.api";
import axios from "axios";
import { loadingText } from "../utils/utils.variables";

export interface Product {
  name: string;
  imageUrl: string;
  basePrice: number;
  productId: number;
  published: boolean;
}

const Products = () => {
  const { products, error, loading } = useAdminProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  return loading || error ? (
    <div className="flex justify-center items-center h-64">
      {loading && <Loading />}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
      {products.map((product) => (
        <Product
          key={product.productId}
          {...product}
          setModalOpen={setModalOpen}
          setSelectedProduct={setSelectedProduct}
        />
      ))}
      <ImageUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedProduct={selectedProduct}
      />
    </div>
  );
};

export default Products;

const Product = ({
  imageUrl,
  name,
  basePrice,
  productId,
  published,
  setModalOpen,
  setSelectedProduct,
}: {
  imageUrl: string;
  name: string;
  basePrice: number;
  productId: number;
  published: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const handlePublish = async () => {
      try {
        setPublishing(true);
        setError(null);
        setSuccess(null);
        const {success, message} = await publishProduct(productId);
        alert(JSON.stringify({success, message}));
        if(success){
          setSuccess(message);
        } else {
          setError(message);
        }

      } catch (error) {
        if (error instanceof axios.AxiosError && error.response?.data) {
          setError(error?.response?.data?.message || "Something went wrong");
        }
        else {
          setError("An unexpected error occurred");
        }
        
      } finally{
        setPublishing(false);
      }
  }
  return (
    <div className="border rounded-lg shadow-sm bg-white p-2 flex flex-col h-full">
      <div className="relative w-full pt-[100%] mb-2">
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-contain rounded-md"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-xs sm:text-sm font-semibold mb-1 text-center line-clamp-2">
          {name}
        </h3>
        <p className="text-red-500 text-xs sm:text-sm font-bold mb-2 text-center">
          প্রাইস: ৳{basePrice}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 w-full mt-auto">
        <button
          onClick={() => {
            setModalOpen(true);
            setSelectedProduct(productId);
          }}
          className="w-full px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-xs sm:text-sm"
        >
          📷 আরো ছবি যোগ করুন
        </button>
        <button className="w-full px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-xs sm:text-sm">
          অন্যান্য তথ্য যোগ করুন
        </button>
         {
          !published && <>
           <button className="w-full px-2 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 text-xs sm:text-sm" onClick={handlePublish}>
          { publishing ? loadingText:'পাবলিশ করুন '} 
        </button>
      
        {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
        {success && <p className="text-green-500 text-xs sm:text-sm">{success}</p>}</>
         }
      </div>
    </div>
  );
};
