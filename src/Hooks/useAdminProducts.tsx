import { useEffect, useState } from "react";
import { getAdminProducts } from "../Api/product.api";
import { Product } from "../Components/AdminProducts";

const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminProducts = async () => {
      setLoading(true);
      try {
        const { success, data, message } = await getAdminProducts();
        if (success) {
          setProducts(data?.products || []);
        } else {
          setError(message);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProducts();
  }, []);

  return { products, loading, error };
};

export default useAdminProducts;
