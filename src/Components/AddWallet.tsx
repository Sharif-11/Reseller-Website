import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { getWalletList, addWallet } from '../Api/seller.api';

interface Wallet {
  id: string;
  walletName: 'bKash' | 'Nagad';
  walletPhoneNo: string;
}

const AddWallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bKash' as 'bKash' | 'Nagad',
    number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({
    form: '',
    number: ''
  });

  // Fetch wallets on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setIsFetching(true);
        const response = await getWalletList();
        if (response.success && response.data) {
          setWallets(response.data);
        } else {
          setErrors(prev => ({
            ...prev,
            form: response.message || 'Failed to load wallets'
          }));
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          form: 'Failed to load wallets'
        }));
        console.error('Error fetching wallets:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchWallets();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when typing
    if (name === 'number') {
      setErrors(prev => ({ ...prev, number: '' }));
    }
  };

  const validatePhoneNumber = (number: string) => {
    if (!number.trim()) {
      setErrors(prev => ({
        ...prev,
        number: 'মোবাইল নাম্বার দিন'
      }));
      return false;
    }
    if (!/^01[3-9]\d{8}$/.test(number)) {
      setErrors(prev => ({
        ...prev,
        number: 'সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)'
      }));
      return false;
    }
    return true;
  };

  const addNewWallet = async () => {
    if (!validatePhoneNumber(formData.number)) return;

    setIsLoading(true);
    try {
      const response = await addWallet(formData.number, formData.type);
      
      if (response.success && response.data) {
        setWallets(prev => [...prev, response.data]);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to add wallet');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'ওয়ালেট যোগ করতে ব্যর্থ'
      }));
      console.error('Error adding wallet:', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'bKash',
      number: '',
    });
    setErrors({ form: '', number: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">আমার ওয়ালেট</h1>
        {wallets.length < 3 && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
            disabled={isFetching}
          >
            <FiPlus className="text-sm sm:text-base" /> 
            <span>ওয়ালেট যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Error message for form */}
      {errors.form && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded text-sm sm:text-base">
          {errors.form}
        </div>
      )}

      {/* Add Wallet Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">নতুন ওয়ালেট যোগ করুন</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            addNewWallet();
          }}>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ওয়ালেট টাইপ
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মোবাইল নাম্বার
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  className={`w-full p-2 text-sm sm:text-base border rounded focus:ring-blue-500 focus:border-blue-500 ${
                    errors.number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.number && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.number}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                disabled={isLoading}
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    যোগ করা হচ্ছে...
                  </span>
                ) : 'ওয়ালেট যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wallet limit message */}
      {wallets.length >= 3 && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm sm:text-base">
          আপনি সর্বোচ্চ ৩টি ওয়ালেট যোগ করতে পারবেন
        </div>
      )}

      {/* Wallets List */}
      {isFetching && wallets.length === 0 ? (
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : wallets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">কোন ওয়ালেট যোগ করা হয়নি</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
            {wallets.map(wallet => (
              <div
                key={wallet.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="font-medium text-sm sm:text-base">
                    {wallet.walletName === 'bKash' ? (
                      <span className="text-green-600">bKash</span>
                    ) : (
                      <span className="text-purple-600">Nagad</span>
                    )}
                  </span>
                </div>
                <div className="text-gray-700 text-sm sm:text-base">{wallet.walletPhoneNo}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWallet;