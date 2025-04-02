import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { FaHeart, FaSpinner, FaRegSadTear } from 'react-icons/fa';
import { FavoriteProduct } from '../types/product.types';
import { ITEMS_PER_PAGE, FAVORITES_KEY } from '../utils/utils.variables';

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true);
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        }
      } catch (err) {
        setError('Failed to load favorites. Please try again.');
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = (productId: number) => {
    const updatedFavorites = favorites.filter(fav => fav.productId !== productId);
    setFavorites(updatedFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
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

  const navigateToProductDetail = (product: FavoriteProduct) => {
    navigate(`/products/${product.productId}`, {
      state: { product }
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
        <span className="ml-2">Loading favorites...</span>
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

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FaRegSadTear className="text-4xl mb-4" />
        <p className="text-xl">No favorite products yet</p>
        <p className="text-sm mt-2">Add products to your favorites to see them here</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Products ({favorites.length})</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {paginatedFavorites.map(product => (
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
                  removeFavorite(product.productId);
                }}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={`Remove ${product.name} from favorites`}
                title="Remove from favorites"
              >
                <FaHeart className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                  currentPage === page 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Favorites;