import { useEffect, useState } from 'react';
import { FiPlus, FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

import { Wallet } from '../Context/userContext';
import { useAuth } from '../Hooks/useAuth';
import { addAdminWallet, deleteAdminWallet, getAllAdminWallets } from '../Api/admin.api';

const AdminWalletManagement = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>(user?.wallets || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bKash' as 'bKash' | 'Nagad',
    number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({
    form: '',
    number: '',
  });
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setIsFetching(true);
        const response = await getAllAdminWallets();
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

  const handleAddWallet = async () => {
    if (!validatePhoneNumber(formData.number)) return;

    setIsLoading(true);
    try {
      const response = await addAdminWallet({
        walletName: formData.type,
        walletPhoneNo: formData.number,
      });
      
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
      console.error('Error adding wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!walletToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteAdminWallet({ walletId: walletToDelete.walletId });
      
      if (response.success) {
        setWallets(prev => prev.filter(wallet => wallet.walletId !== walletToDelete.walletId));
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      } else {
        throw new Error(response.message || 'Failed to delete wallet');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'ওয়ালেট ডিলিট করতে ব্যর্থ'
      }));
      console.error('Error deleting wallet:', error);
    } finally {
      setIsDeleting(false);
      setWalletToDelete(null);
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-5xl relative">
      {/* Delete Confirmation Modal */}
      {walletToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  ওয়ালেট ডিলিট করুন
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    আপনি কি নিশ্চিত যে আপনি এই ওয়ালেটটি ডিলিট করতে চান?
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {walletToDelete.walletName}: {walletToDelete.walletPhoneNo}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setWalletToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                disabled={isDeleting}
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteWallet}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ডিলিট করা হচ্ছে...
                  </span>
                ) : 'ডিলিট'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Notification */}
      {showDeleteSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">ওয়ালেট সফলভাবে ডিলিট করা হয়েছে</span>
            <button
              onClick={() => setShowDeleteSuccess(false)}
              className="absolute top-0 right-0 px-2 py-1"
            >
              <FiX className="h-5 w-5 text-green-700" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">ওয়ালেট ম্যানেজমেন্ট</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
          disabled={isFetching}
        >
          <FiPlus className="text-sm sm:text-base" /> 
          <span>ওয়ালেট যোগ করুন</span>
        </button>
      </div>

      {/* Error message for form */}
      {errors.form && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded text-sm sm:text-base">
          {errors.form}
        </div>
      )}

      {/* Add Wallet Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8 relative">
          <button
            onClick={resetForm}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-lg" />
          </button>
          
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">নতুন ওয়ালেট যোগ করুন</h2>
          
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
              type="button"
              onClick={handleAddWallet}
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
              ) : 'যোগ করুন'}
            </button>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.walletId}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 relative hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setWalletToDelete(wallet)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                  title="Delete wallet"
                >
                  <FiTrash2 className="text-sm sm:text-base" />
                </button>
                
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

export default AdminWalletManagement;