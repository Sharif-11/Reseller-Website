import { useState, useEffect } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { getWalletList, requestWithdraw } from '../Api/seller.api';
import { calculateWithdrawal } from '../utils/withdraw.utils';
import { useNavigate } from 'react-router-dom';

interface Wallet {
  walletId: number;
  walletName: 'bKash' | 'Nagad';
  walletPhoneNo: string;
  userId: string;
  userName: string;
  userPhoneNo: string;
  createdAt: string;
}

interface WithdrawalDetails {
  amount: number;
  actualAmount: number;
  transactionFee: number;
  walletName: 'bKash' | 'Nagad';
  walletPhoneNo: string;
}

const WithdrawRequest = () => {
  const { user } = useAuth();
  const navigate=useNavigate()
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState({
    wallet: '',
    amount: '',
    form: ''
  });
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState<'bKash' | 'Nagad'>('bKash');

  // Calculate withdrawal details when amount or wallet changes
  useEffect(() => {
    if (selectedWallet && amount) {
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue)) {
        try {
          const details = calculateWithdrawal(
            selectedWallet.walletName,
            selectedWallet.walletPhoneNo,
            amountValue
          );
          setWithdrawalDetails(details);
          setErrors(prev => ({ ...prev, amount: '' }));
        } catch (error) {
          setErrors(prev => ({
            ...prev,
            amount: (error as Error).message
          }));
          setWithdrawalDetails(null);
        }
      } else {
        setWithdrawalDetails(null);
      }
    } else {
      setWithdrawalDetails(null);
    }
  }, [amount, selectedWallet]);

  // Fetch user's wallets and balance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const cachedWallets = localStorage.getItem(`wallets-${user?.phoneNo}`);
        
        if (cachedWallets) {
          setWallets(JSON.parse(cachedWallets));
          setBalance(user?.balance || 0); 
          return;
        }

        const response = await getWalletList();
        if (response.success && response.data) {
          setWallets(response.data);
          localStorage.setItem(`wallets-${user?.phoneNo}`, JSON.stringify(response.data));
          setBalance(user?.balance || 0);
        } else {
          setErrors(prev => ({
            ...prev,
            form: response.message || 'ডেটা লোড করতে সমস্যা হয়েছে'
          }));
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          form: 'ডেটা লোড করতে সমস্যা হয়েছে'
        }));
        console.error('Error fetching data:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [user?.phoneNo, user?.balance]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { wallet: '', amount: '', form: '' };
    
    if (!selectedWallet) {
      newErrors.wallet = 'একটি ওয়ালেট নির্বাচন করুন';
      isValid = false;
    }
    
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
      newErrors.amount = 'সঠিক পরিমাণ লিখুন';
      isValid = false;
    } else if (withdrawalDetails === null) {
      newErrors.amount = 'অবৈধ উইথড্র পরিমাণ';
      isValid = false;
    } else if (amountValue > balance) {
      newErrors.amount = 'আপনার ব্যালেন্স পর্যাপ্ত নয়';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !withdrawalDetails) return;
    
    try {
      setIsLoading(true);
      
      const response = await requestWithdraw({
        amount: withdrawalDetails.amount,
        walletName: withdrawalDetails.walletName,
        walletPhoneNo: withdrawalDetails.walletPhoneNo
      });
      
      if (response.success) {
        navigate('/withdraw-history')
        setErrors(prev => ({ ...prev, form: 'উইথড্র রিকোয়েস্ট সফল হয়েছে' }));
        setSelectedWallet(null);
        setAmount('');
        setWithdrawalDetails(null);
        if (response.data?.newBalance) {
          setBalance(response.data.newBalance);
        }
      } else {
        throw new Error(response.message || 'উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে'
      }));
      console.error('Withdrawal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const PolicyTabs = () => (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        className={`py-2 px-4 font-medium text-sm ${activePolicyTab === 'bKash' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setActivePolicyTab('bKash')}
      >
        bKash নীতিমালা
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm ${activePolicyTab === 'Nagad' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        onClick={() => setActivePolicyTab('Nagad')}
      >
        Nagad নীতিমালা
      </button>
    </div>
  );

  const PolicyContent = () => {
    if (activePolicyTab === 'bKash') {
      return (
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>ন্যূনতম উইথড্র পরিমাণ: ৫০৳</li>
          <li>১০০০৳ পর্যন্ত ফি: ৫৳</li>
          <li>১০০০৳ এর বেশি ফি: ১০৳</li>
          <li>প্রসেসিং সময়: ২৪-৪৮ ঘন্টা</li>
        </ul>
      );
    }
    return (
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>ন্যূনতম উইথড্র পরিমাণ: ৫০৳</li>
        <li>১০০০৳ পর্যন্ত ফি: ৫৳</li>
        <li>১০০০৳ এর বেশি: প্রতি হাজার টাকায় ৫৳</li>
        <li>প্রসেসিং সময়: ২৪-৪৮ ঘন্টা</li>
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">উইথড্র রিকোয়েস্ট</h1>
      
      {/* Balance Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">বর্তমান ব্যালেন্স:</span>
          <span className="text-xl font-bold text-blue-600">{balance} ৳</span>
        </div>
      </div>
      
      {/* Error message */}
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {errors.form}
        </div>
      )}
      
      {/* Withdraw Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="space-y-4">
          {/* Wallet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ওয়ালেট নির্বাচন করুন
            </label>
            <select
              value={selectedWallet?.walletId || ''}
              onChange={(e) => {
                const selectedWalletId = Number(e.target.value);
                const wallet = wallets.find(w => w.walletId === selectedWalletId);
                setSelectedWallet(wallet || null);
                setErrors(prev => ({ ...prev, wallet: '' }));
              }}
              className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
                errors.wallet ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching}
            >
              <option value="">ওয়ালেট নির্বাচন করুন</option>
              {wallets.map((wallet) => (
                <option key={wallet.walletId} value={wallet.walletId}>
                  {wallet.walletName} - {wallet.walletPhoneNo}
                </option>
              ))}
            </select>
            {errors.wallet && (
              <p className="mt-1 text-xs text-red-600">{errors.wallet}</p>
            )}
          </div>
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পরিমাণ (৳)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors(prev => ({ ...prev, amount: '' }));
              }}
              placeholder="পরিমাণ লিখুন"
              min="0"
              step="1"
              className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching || !selectedWallet}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
            )}
            {selectedWallet && (
              <p className="mt-1 text-xs text-gray-500">
                ন্যূনতম উইথড্র: ৫০৳
              </p>
            )}
          </div>
          
          {/* Summary */}
          {withdrawalDetails && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>উইথড্র পরিমাণ:</span>
                <span>{withdrawalDetails.amount.toFixed(2)}৳</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ফি:</span>
                <span>{withdrawalDetails.transactionFee.toFixed(2)}৳</span>
              </div>
              <div className="flex justify-between font-medium mt-1">
                <span>প্রাপ্ত অর্থ:</span>
                <span>{withdrawalDetails.actualAmount.toFixed(2)}৳</span>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isFetching || !withdrawalDetails}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                প্রসেসিং...
              </span>
            ) : 'রিকোয়েস্ট জমা দিন'}
          </button>
        </div>
      </form>
      
      {/* Withdrawal Policy */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">উইথড্র নীতিমালা</h3>
        <PolicyTabs />
        <PolicyContent />
      </div>
    </div>
  );
};

export default WithdrawRequest;