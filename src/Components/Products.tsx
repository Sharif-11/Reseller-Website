import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiHeart } from 'react-icons/fi';
import { FaHeart, FaSpinner } from 'react-icons/fa';
import { getAllProducts } from '../Api/product.api';

interface Product {
  productId: number;
  name: string;
  imageUrl: string;
  basePrice: number;
  published: boolean;
  category: string;
  stockSize: number;
  suggestedMaxPrice: number;
  description: string;
  location: string;
  deliveryChargeInside: number;
  deliveryChargeOutside: number;
  videoUrl: string;
  images: { imageId: number; imageUrl: string }[];
  metas: { key: string; value: string }[];
}

const FAVORITES_KEY = 'product_favorites_v2';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Initialize favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((id): id is number => typeof id === 'number'));
        }
      } catch (err) {
        console.error('Error parsing favorites:', err);
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const downloadImage = async (imageUrl: string, productName: string, productId: number) => {
    try {
      setDownloadingId(productId);
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 
                       blob.type.split('/')[1] || 
                       'jpg';
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${productName.replace(/\s+/g, '_')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloadingId(null);
      }, 100);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
      setDownloadingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const navigateToProductDetail = (product: Product) => {
    navigate(`/products/${product.productId}`, {
      state: { product }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {products.filter(p => p.published).map(product => (
          <div
            key={product.productId}
            className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group"
          >
            <div 
              className="cursor-pointer"
              onClick={() => navigateToProductDetail(product)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            </div>

            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-800 truncate">
                {product.name}
              </h3>
              <p className="text-md font-bold text-gray-900 mt-1">
                {formatPrice(product.basePrice)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {product.stockSize > 0 ? `${product.stockSize} in stock` : 'Out of stock'}
              </p>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  downloadImage(product.imageUrl, product.name, product.productId);
                }}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={`Download ${product.name} image`}
                title="Download image"
                disabled={downloadingId === product.productId}
              >
                {downloadingId === product.productId ? (
                  <FaSpinner className="animate-spin text-blue-500" />
                ) : (
                  <FiDownload className="text-gray-700" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(product.productId);
                }}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={
                  favorites.includes(product.productId)
                    ? `Remove ${product.name} from favorites`
                    : `Add ${product.name} to favorites`
                }
                title={favorites.includes(product.productId) ? "Remove from favorites" : "Add to favorites"}
              >
                {favorites.includes(product.productId) ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FiHeart className="text-gray-700 hover:text-red-500" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available</p>
        </div>
      )}
    </div>
  );
};

export default Products;