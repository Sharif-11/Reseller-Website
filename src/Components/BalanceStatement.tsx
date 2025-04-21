import { useState, useEffect } from 'react';
import { formatDate } from '../utils/date.utils';
import { getTransactionHistory } from '../Api/seller.api';
import { toast } from 'react-toastify';
import { useAuth } from '../Hooks/useAuth';

interface Transaction {
  id: number;
  userId: string;
  userName: string;
  userPhoneNo: string;
  type: 'Credit' | 'Debit';
  amount: string;
  reason: string;
  reference: string | null;
  referralLevel: string | null;
  remarks: string;
  paymentMethod: string;
  paymentPhoneNo: string | null;
  transactionId: string | null;
  createdAt: string;
}

interface TransactionResponse {
  transactionList: Transaction[];
  totalTransactions: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  calculatedBalance: number; // Assuming the API returns this as well
  totalCredit: number;
  totalDebit: number;
}

const BalanceStatement = () => {
  const { reloadUser } = useAuth(); // Assuming you have a useAuth hook to get user info
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [calculatedBalance, setCalculatedBalance] = useState(0);  
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalTransactions: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async (page: number = pagination.currentPage, pageSize: number = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await getTransactionHistory({ page, pageSize });
      
      if (response.success && response.data) {
        const data = response.data as TransactionResponse;
        setTransactions(data.transactionList);
        setFilteredTransactions(data.transactionList);
        setPagination({
          currentPage: data.currentPage,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalTransactions: data.totalTransactions
        });
        setCalculatedBalance(data.calculatedBalance); 
        setTotalCredit(data.totalCredit);
        setTotalDebit(data.totalDebit);
      } else {
        toast.error(response.message || 'Transactions লোড করতে ব্যর্থ হয়েছে');
      }
    } catch (error) {
      toast.error('Transactions আনতে সমস্যা হয়েছে');
      console.error('Transactions fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(tx => 
        tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  useEffect(() => {
    fetchTransactions();
    reloadUser(); // Reload user data when component mounts
  }, []);



  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    return type === 'Credit' 
      ? <span className={`${baseClasses} bg-green-100 text-green-800`}>ক্রেডিট</span>
      : <span className={`${baseClasses} bg-red-100 text-red-800`}>ডেবিট</span>;
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchTransactions(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    fetchTransactions(1, newPageSize);
  };

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">ব্যালেন্স স্টেটমেন্ট</h1>
      
      {/* ব্যালেন্স সারাংশ */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-base sm:text-lg font-medium text-gray-700">বর্তমান ব্যালেন্স</h2>
            <p className="text-xl sm:text-2xl font-bold">
              {calculatedBalance}৳
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full sm:w-auto">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500">মোট ক্রেডিট</p>
              <p className="text-green-600 font-medium text-sm sm:text-base">
                {totalCredit}৳
              </p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-500">মোট ডেবিট</p>
              <p className="text-red-600 font-medium text-sm sm:text-base">
                {totalDebit}৳
              </p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500">মোট লেনদেন</p>
              <p className="text-blue-600 font-medium text-sm sm:text-base">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* লেনদেনের ইতিহাস */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* সার্চ এবং ফিল্টার সেকশন */}
        <div className="p-3 md:p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Transaction ID, Method বা Reason দিয়ে খুঁজুন"
              className="pl-8 pr-3 py-2 border rounded-md text-xs md:text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border rounded-md px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm"
            >
              <option value="5">পৃষ্ঠায় ৫টি</option>
              <option value="10">পৃষ্ঠায় ১০টি</option>
              <option value="20">পৃষ্ঠায় ২০টি</option>
              <option value="50">পৃষ্ঠায় ৫০টি</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-xs md:text-sm">
              {searchTerm ? 'আপনার সার্চের সাথে মিলে এমন কোনো লেনদেন পাওয়া যায়নি' : 'কোনো লেনদেন পাওয়া যায়নি'}
            </p>
          </div>
        ) : (
          <>
            {/* মোবাইল ভিউ - কার্ড */}
            <div className="md:hidden space-y-2 p-2">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="border rounded-lg p-2 text-xs cursor-pointer hover:bg-gray-50"
                  onClick={() => showTransactionDetails(tx)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xxs">{formatDate(tx.createdAt)}</p>
                      <h3 className="font-medium text-xs">{tx.reason}</h3>
                    </div>
                    <div>
                      {getTypeBadge(tx.type)}
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xxs">
                    <div>
                      <p className="text-gray-500">পরিমাণ:</p>
                      <p className={`font-medium ${
                        tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'Credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}৳
                      </p>
                    </div>
                    {tx.paymentMethod && (
                      <div>
                        <p className="text-gray-500">পদ্ধতি:</p>
                        <p className="font-medium">{tx.paymentMethod}</p>
                      </div>
                    )}
                    {tx.transactionId && (
                      <div>
                        <p className="text-gray-500">Transaction ID:</p>
                        <p className="font-medium truncate">{tx.transactionId}</p>
                      </div>
                    )}
                    {tx.type === 'Credit' && tx.referralLevel && (
                      <div>
                        <p className="text-gray-500">রেফারেল লেভেল:</p>
                        <p className="font-medium">{tx.referralLevel}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* ডেস্কটপ ভিউ - টেবিল */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ধরণ</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">পরিমাণ</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">কারণ</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">পদ্ধতি</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">বিস্তারিত</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getTypeBadge(tx.type)}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap font-medium ${
                        tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'Credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}৳
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                        {tx.reason}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                        {tx.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                        {tx.transactionId || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => showTransactionDetails(tx)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* প্যাজিনেশন */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-3 py-2 md:px-4 md:py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-3 py-1 text-xs border border-gray-300 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-3 py-1 text-xs border border-gray-300 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    পরবর্তী
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      দেখানো হচ্ছে <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> থেকে{' '}
                      <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalTransactions)}</span> পর্যন্ত, মোট{' '}
                      <span className="font-medium">{pagination.totalTransactions}</span> টি লেনদেন
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* লেনদেনের বিস্তারিত মোডাল */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-3 md:p-4 border-b">
              <h2 className="text-base md:text-lg font-medium">লেনদেনের বিস্তারিত</h2>
            </div>
            
            <div className="p-3 md:p-4 space-y-3 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700">ধরণ:</p>
                  <div className="mt-1">
                    {getTypeBadge(selectedTransaction.type)}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700">তারিখ:</p>
                  <p className="mt-1 text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700">পরিমাণ:</p>
                  <p className={`mt-1 font-medium ${
                    selectedTransaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'Credit' ? '+' : '-'}{parseFloat(selectedTransaction.amount).toFixed(2)}৳
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">কারণ:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.reason}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-700">পেমেন্ট পদ্ধতি:</p>
                <p className="mt-1 text-gray-900">{selectedTransaction.paymentMethod || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700">Transaction ID:</p>
                  <p className="mt-1 text-gray-900 break-words">{selectedTransaction.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">পেমেন্ট ফোন:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.paymentPhoneNo || 'N/A'}</p>
                </div>
              </div>

              {/* ক্রেডিট টাইপের জন্য রেফারেন্স দেখানো */}
              {selectedTransaction.type === 'Credit' && selectedTransaction.reference && (
                <div>
                  <p className="font-medium text-gray-700">রেফারেন্স:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.reference}</p>
                </div>
              )}

              {/* ক্রেডিট টাইপের জন্য রেফারেল লেভেল দেখানো */}
              {selectedTransaction.type === 'Credit' && selectedTransaction.referralLevel && (
                <div>
                  <p className="font-medium text-gray-700">রেফারেল লেভেল:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.referralLevel}</p>
                </div>
              )}

              {selectedTransaction.remarks && (
                <div>
                  <p className="font-medium text-gray-700">মন্তব্য:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.remarks}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium text-gray-700">ব্যবহারকারীর তথ্য:</p>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  <p className="text-gray-900">নাম: {selectedTransaction.userName}</p>
                  <p className="text-gray-900">ফোন: {selectedTransaction.userPhoneNo}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 md:p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceStatement;