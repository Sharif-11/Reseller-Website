import useAdminProducts from "../Hooks/useAdminProducts";
import Loading from "./Loading";

export interface Product {
  name: string;
  imageUrl: string;
  basePrice: number;
}

const Products = () => {
  const { products, error, loading } = useAdminProducts();

  return loading || error ? (
    <div className="flex justify-center items-center h-64">
      {loading && <Loading />}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {products.map((product, index) => (
        <Product key={index} {...product} />
      ))}
    </div>
  );
};

export default Products;

const Product = ({ imageUrl, name, basePrice }: Product) => {
  return (
    <div className="border rounded-lg shadow-md bg-white p-4 flex flex-col h-full">
      <div className="relative w-full pt-[100%] mb-4">
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-contain rounded-md"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-semibold mb-2 text-center line-clamp-2">
          {name}
        </h3>
        <p className="text-red-500 text-sm font-bold mb-4 text-center">
          প্রাইস: ৳{basePrice}
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full mt-auto">
        <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm">
          📷 আরো ছবি যোগ করুন
        </button>
        <button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm">
          অন্যান্য তথ্য যোগ করুন
        </button>
      </div>
    </div>
  );
};
