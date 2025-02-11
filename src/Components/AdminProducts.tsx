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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product, index) => (
        <Product key={index} {...product} />
      ))}
    </div>
  );
};

export default Products;

const Product = ({ imageUrl, name, basePrice }: Product) => {
  return (
    <div className="border rounded-lg shadow-md bg-white p-4 flex flex-col items-center">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="text-sm font-semibold mt-3 text-center">{name}</h3>
      <p className="text-red-500 text-sm font-bold mt-1">
        প্রাইস: ৳{basePrice}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
        <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          📷 আরো ছবি যোগ করুন
        </button>
        <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          অন্যান্য তথ্য যোগ করুন
        </button>
      </div>
    </div>
  );
};
