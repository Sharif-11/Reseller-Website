import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiDownload, FiHeart, FiCopy, FiYoutube, FiShoppingCart } from 'react-icons/fi';
import { FaHeart, FaSpinner } from 'react-icons/fa';
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables';
import { CartItem } from '../types/cart.types';
import { Product } from '../types/product.types';
import { v4 as uuidv4 } from 'uuid';

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as Product;
  
  const [favorites, setFavorites] = useState<number[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [sellingPrice, setSellingPrice] = useState(product?.basePrice.toString() || '0');
  const [selectedMeta, setSelectedMeta] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string>(product?.imageUrl || '');
  const [copied, setCopied] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    quantity: '',
    sellingPrice: '',
    options: '',
    image: ''
  });

  // Load favorites and set default selected image
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (err) {
        console.error('Error loading favorites:', err);
        localStorage.removeItem(FAVORITES_KEY);
      }
    }

    // Set main image as default selected image
    if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);
    }
  }, [product]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = () => {
    if (!product) return;
    setFavorites(prev =>
      prev.includes(product.productId)
        ? prev.filter(id => id !== product.productId)
        : [...prev, product.productId]
    );
  };

  const downloadImage = async (url: string, name: string, id: string) => {
    try {
      setDownloadingId(id);
      const response = await fetch(url);
      const blob = await response.blob();
      const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, '_')}_${id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloadingId(null);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadingId(null);
    }
  };

  const copyDescription = () => {
    if (!product) return;
    navigator.clipboard.writeText(product.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMetaSelect = (key: string, value: string) => {
    setSelectedMeta(prev => ({ ...prev, [key]: value }));
    if (inputErrors.options) {
      setInputErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (inputErrors.image) {
      setInputErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);
    
    if (value === '') {
      setInputErrors(prev => ({ ...prev, quantity: 'Quantity is required' }));
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setInputErrors(prev => ({ ...prev, quantity: 'Must be a number' }));
      return;
    }
    
    if (numValue < 1) {
      setInputErrors(prev => ({ ...prev, quantity: 'Minimum quantity is 1' }));
      return;
    }
    
    setInputErrors(prev => ({ ...prev, quantity: '' }));
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellingPrice(value);
    
    if (value === '') {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'Price is required' }));
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'Must be a number' }));
      return;
    }
    
    if (numValue < product.basePrice) {
      setInputErrors(prev => ({ ...prev, sellingPrice: `Minimum price is ৳${product.basePrice}` }));
      return;
    }
    
    setInputErrors(prev => ({ ...prev, sellingPrice: '' }));
  };

  const addToCart = () => {
    const allOptionsSelected = product.metas.every(meta => selectedMeta[meta.key]);
    if (!allOptionsSelected && product.metas.length > 0) {
      setInputErrors(prev => ({ ...prev, options: 'Please select all options' }));
      return;
    }

    if (!selectedImage) {
      setInputErrors(prev => ({ ...prev, image: 'Please select an image' }));
      return;
    }

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(sellingPrice);
    
    if (isNaN(quantityNum)) {
      setInputErrors(prev => ({ ...prev, quantity: 'Invalid quantity' }));
      return;
    }
    
    if (isNaN(priceNum)) {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'Invalid price' }));
      return;
    }
    
    if (quantityNum < 1) {
      setInputErrors(prev => ({ ...prev, quantity: 'Minimum quantity is 1' }));
      return;
    }
    
    if (priceNum < product.basePrice) {
      setInputErrors(prev => ({ ...prev, sellingPrice: `Minimum price is ৳${product.basePrice}` }));
      return;
    }
    
    const cartItem: CartItem = {
      productId: product.productId,
      name: product.name,
      basePrice: product.basePrice,
      sellingPrice: priceNum,
      quantity: quantityNum,
      imageUrl: selectedImage, // Store the selected image URL
      selectedOptions: { ...selectedMeta },
      cartItemId: uuidv4()
    };
    
    const existingCart = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]');
    const updatedCart = [...existingCart, cartItem];

    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCart));
    navigate('/cart');
  };

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const metaInfo = product.metas.reduce<Record<string, string[]>>((acc, meta) => {
    if (!acc[meta.key]) {
      acc[meta.key] = [];
    }
    if (!acc[meta.key].includes(meta.value)) {
      acc[meta.key].push(meta.value);
    }
    return acc;
  }, {});

  // Combine main image and additional images for selection
  const allImages = [
    { imageUrl: product.imageUrl, isMain: true },
    ...product.images.map(img => ({ imageUrl: img.imageUrl, isMain: false }))
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Image */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => downloadImage(selectedImage || product.imageUrl, product.name, 'main')}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                disabled={downloadingId === 'main'}
                title="Download image"
              >
                {downloadingId === 'main' ? (
                  <FaSpinner className="animate-spin text-blue-500" />
                ) : (
                  <FiDownload className="text-gray-700" />
                )}
              </button>
              
              <button
                onClick={toggleFavorite}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                title={favorites.includes(product.productId) ? "Remove from favorites" : "Add to favorites"}
              >
                {favorites.includes(product.productId) ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FiHeart className="text-gray-700 hover:text-red-500" />
                )}
              </button>
              
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  title="Watch YouTube video"
                >
                  <FiYoutube className="text-red-600" />
                </a>
              )}
            </div>
          </div>

          {/* Image Selection */}
          <div className="p-4 border-t">
            <h3 className="font-medium mb-2">Select Image</h3>
            {inputErrors.image && (
              <p className="text-red-500 text-sm mb-2">{inputErrors.image}</p>
            )}
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => handleImageSelect(img.imageUrl)}
                  className={`relative cursor-pointer border-2 rounded-md overflow-hidden ${selectedImage === img.imageUrl ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                  {img.isMain && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>
          
          {/* Price Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">Price:</span>
              <span className="text-xl font-bold text-gray-900">
                {product.basePrice}
              </span>
              <span className="text-lg font-semibold">৳</span>
              {product.stockSize > 0 ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                  In Stock
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                  Out of Stock
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">Suggested max price:</span>
              <span className="text-lg text-[#e5307e] font-bold">
                {product.suggestedMaxPrice}
              </span>
              ৳
            </div>
          </div>

          {/* Meta Info */}
          {Object.entries(metaInfo).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <h3 className="font-medium capitalize">{key}</h3>
              <div className="flex flex-wrap gap-2">
                {values.map(value => (
                  <label key={value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={key}
                      checked={selectedMeta[key] === value}
                      onChange={() => handleMetaSelect(key, value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {inputErrors.options && (
            <p className="text-red-500 text-sm">{inputErrors.options}</p>
          )}

          {/* Quantity and Selling Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={handleQuantityChange}
                className={`w-full px-3 py-2 border ${inputErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter quantity"
              />
              {inputErrors.quantity && (
                <p className="text-red-500 text-xs mt-1">{inputErrors.quantity}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (Min ৳{product.basePrice.toLocaleString('bn-BD')})
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={sellingPrice}
                onChange={handleSellingPriceChange}
                className={`w-full px-3 py-2 border ${inputErrors.sellingPrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter price"
              />
              {inputErrors.sellingPrice && (
                <p className="text-red-500 text-xs mt-1">{inputErrors.sellingPrice}</p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            className={`w-full py-3 px-4 rounded-md font-medium ${!!(inputErrors.quantity || inputErrors.sellingPrice || inputErrors.options || inputErrors.image) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            disabled={!!(inputErrors.quantity || inputErrors.sellingPrice || inputErrors.options || inputErrors.image)}
          >
            <div className="flex items-center justify-center gap-2">
              <FiShoppingCart />
              <span>Add to Cart</span>
            </div>
          </button>

          {/* Description */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Description</h3>
              <button
                onClick={copyDescription}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <FiCopy className="mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Images */}
      {product.images.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Additional Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.images.map((img, index) => (
              <div 
                key={img.imageId} 
                className="relative group cursor-pointer"
                onClick={() => handleImageSelect(img.imageUrl)}
              >
                <img
                  src={img.imageUrl}
                  alt={`${product.name} - ${index + 1}`}
                  className={`w-full h-40 object-cover rounded-lg ${selectedImage === img.imageUrl ? 'ring-2 ring-blue-500' : ''}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(img.imageUrl, `${product.name}_${index + 1}`, `additional_${img.imageId}`);
                  }}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={downloadingId === `additional_${img.imageId}`}
                  title="Download image"
                >
                  {downloadingId === `additional_${img.imageId}` ? (
                    <FaSpinner className="animate-spin text-blue-500" />
                  ) : (
                    <FiDownload className="text-gray-700" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;