import { useState, useEffect } from 'react';
import { formatDate } from '../utils/date.utils';
import { getAllTransactionHistoryForAdmin } from '../Api/admin.api';
import { toast } from 'react-toastify';

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
}

const AdminTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalTransactions: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [phoneNoFilter, setPhoneNoFilter] = useState('');

  const fetchTransactions = async (page: number = 1, pageSize: number = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await getAllTransactionHistoryForAdmin({
        phoneNo: phoneNoFilter || undefined,
        page,
        pageSize
      });
      
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
      } else {
        toast.error(response.message || 'Failed to load transactions');
      }
    } catch (error) {
      toast.error('An error occurred while fetching transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on search term (client-side)
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = transactions.filter(tx => 
        tx.transactionId?.toLowerCase().includes(term) ||
        tx.userId.toLowerCase().includes(term) ||
        tx.userName.toLowerCase().includes(term) ||
        tx.userPhoneNo.toLowerCase().includes(term) ||
        tx.paymentMethod?.toLowerCase().includes(term) ||
        tx.reason.toLowerCase().includes(term) ||
        (tx.paymentPhoneNo && tx.paymentPhoneNo.toLowerCase().includes(term)) ||
        tx.amount.toLowerCase().includes(term)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  // Fetch transactions when phoneNoFilter or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [phoneNoFilter, pagination.pageSize]);

  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    return type === 'Credit' 
      ? <span className={`${baseClasses} bg-green-100 text-green-800`}>Credit</span>
      : <span className={`${baseClasses} bg-red-100 text-red-800`}>Debit</span>;
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchTransactions(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
  };

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  const handlePhoneNoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when applying new phone filter
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchTransactions(1);
  };

//   const clearPhoneNoFilter = () => {
//     setPhoneNoFilter('');
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">Transaction History</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handlePhoneNoSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="phoneNo"
                placeholder="Enter user phone number"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                value={phoneNoFilter}
                onChange={(e) => setPhoneNoFilter(e.target.value)}
              />
             
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Within Results
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by ID, name, amount, etc."
                className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
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
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Pagination Controls - Top */}
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-700">
            {phoneNoFilter ? (
              <span>
                Showing transactions for: <span className="font-medium">{phoneNoFilter}</span>
                {filteredTransactions.length > 0 && (
                  <span> ({filteredTransactions.length} results)</span>
                )}
              </span>
            ) : (
              <span>
                Total Transactions: <span className="font-medium">{pagination.totalTransactions}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm 
                ? 'No transactions match your search criteria' 
                : phoneNoFilter
                  ? 'No transactions found for this phone number'
                  : 'No transactions found'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3 p-3">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="border rounded-lg p-3 text-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => showTransactionDetails(tx)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs">{formatDate(tx.createdAt)}</p>
                      <h3 className="font-medium">{tx.reason}</h3>
                    </div>
                    <div>
                      {getTypeBadge(tx.type)}
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div>
                      <p className="text-gray-500">Amount:</p>
                      <p className={`font-medium ${
                        tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'Credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}৳
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">User:</p>
                      <p className="font-medium">{tx.userName} ({tx.userPhoneNo})</p>
                    </div>
                    {tx.paymentMethod && (
                      <div>
                        <p className="text-gray-500">Method:</p>
                        <p className="font-medium">{tx.paymentMethod}</p>
                      </div>
                    )}
                    {tx.transactionId && (
                      <div>
                        <p className="text-gray-500">Txn ID:</p>
                        <p className="font-medium">{tx.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Txn ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{tx.userName}</div>
                        <div className="text-gray-500 text-xs">{tx.userPhoneNo}</div>
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
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                        {tx.transactionId || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => showTransactionDetails(tx)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalTransactions)}</span> of{' '}
                      <span className="font-medium">{pagination.totalTransactions}</span> transactions
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1 || loading}
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
                            disabled={loading}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${loading ? 'opacity-50' : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages || loading}
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-medium">Transaction Details</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Type:</p>
                  <div className="mt-1">
                    {getTypeBadge(selectedTransaction.type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date:</p>
                  <p className="mt-1 text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Amount:</p>
                  <p className={`mt-1 font-medium ${
                    selectedTransaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'Credit' ? '+' : '-'}{parseFloat(selectedTransaction.amount).toFixed(2)}৳
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Reason:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.reason}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">User:</p>
                <p className="mt-1 text-gray-900">{selectedTransaction.userName} ({selectedTransaction.userPhoneNo})</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Method:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Phone:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.paymentPhoneNo || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
                  <p className="mt-1 text-gray-900 font-mono text-sm">{selectedTransaction.transactionId || 'N/A'}</p>
                </div>
                <div>
                 
                </div>
              </div>

              {selectedTransaction.reference && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Reference:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.reference}</p>
                  <p className="text-sm font-medium text-gray-700">Referral Level:</p>
                  <p className="mt-1 text-gray-900">{selectedTransaction.referralLevel || 'N/A'}</p>
                </div>
              )}

              {selectedTransaction.remarks && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Remarks:</p>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{selectedTransaction.remarks}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t sticky bottom-0 bg-white flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionHistory;