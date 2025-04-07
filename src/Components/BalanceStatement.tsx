import { useState, useEffect } from 'react';
import { formatDate } from '../utils/date.utils';

interface Transaction {
  id: number;
  userId: string;
  userName: string;
  userPhoneNo: string;
  type: 'Credit' | 'Debit' | string;
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

const BalanceStatement = () => {
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

  // Mock data loading - replace with actual API call
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Replace this with actual API call
        // const response = await getTransactionHistory();
        // setTransactions(response.data.transactionList);
        // setPagination({
        //   currentPage: response.data.currentPage,
        //   pageSize: response.data.pageSize,
        //   totalPages: response.data.totalPages,
        //   totalTransactions: response.data.totalTransactions
        // });
        
        // Using mock data for now
        const mockData = {
          transactionList: [
            {
              "id": 9,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "450",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "Nagad",
              "paymentPhoneNo": null,
              "transactionId": "12345689987878",
              "createdAt": "2025-04-05T09:26:33.414Z"
            },
            {
              "id": 8,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "126",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "Nagad",
              "paymentPhoneNo": null,
              "transactionId": "12345689566567",
              "createdAt": "2025-04-05T09:19:07.323Z"
            },
            {
              "id": 7,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "766",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "Nagad",
              "paymentPhoneNo": "01776775495",
              "transactionId": "12345689566",
              "createdAt": "2025-04-05T08:48:54.903Z"
            },
            {
              "id": 4,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "1005",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "bKash",
              "paymentPhoneNo": "01865926160",
              "transactionId": "Tnxfgh",
              "createdAt": "2025-04-04T20:09:03.875Z"
            },
            {
              "id": 3,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "100",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "bKash",
              "paymentPhoneNo": "01776775495",
              "transactionId": "123456789",
              "createdAt": "2025-04-04T19:29:26.290Z"
            },
            {
              "id": 2,
              "userId": "cm8tf7mwg0001gn2hf4mmzgg7",
              "userName": "Shariful Islam",
              "userPhoneNo": "01865926160",
              "type": "Debit",
              "amount": "2000",
              "reason": "Withdraw",
              "reference": null,
              "referralLevel": null,
              "remarks": "",
              "paymentMethod": "bKash",
              "paymentPhoneNo": "01776775495",
              "transactionId": "123456",
              "createdAt": "2025-04-04T19:11:16.651Z"
            }
          ],
          totalTransactions: 6,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        };
        
        setTransactions(mockData.transactionList);
        setFilteredTransactions(mockData.transactionList);
        setPagination({
          currentPage: mockData.currentPage,
          pageSize: mockData.pageSize,
          totalPages: mockData.totalPages,
          totalTransactions: mockData.totalTransactions
        });
      } catch (error) {
        console.error('Error loading transaction history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter transactions based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(tx => 
        tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const calculateBalance = () => {
    let balance = 0;
    transactions.forEach(tx => {
      if (tx.type === 'Credit') {
        balance += parseFloat(tx.amount);
      } else {
        balance -= parseFloat(tx.amount);
      }
    });
    return balance.toFixed(2);
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    return type === 'Credit' 
      ? <span className={`${baseClasses} bg-green-100 text-green-800`}>Credit</span>
      : <span className={`${baseClasses} bg-red-100 text-red-800`}>Debit</span>;
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    // Here you would typically make an API call with the new page number
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }));
    // Here you would typically make an API call with the new page size
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">Balance Statement</h1>
      
      {/* Balance Summary */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-700">Current Balance</h2>
            <p className="text-2xl font-bold">{calculateBalance()}৳</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Credit</p>
              <p className="text-green-600 font-medium">
                {transactions
                  .filter(tx => tx.type === 'Credit')
                  .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                  .toFixed(2)}৳
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Debit</p>
              <p className="text-red-600 font-medium">
                {transactions
                  .filter(tx => tx.type === 'Debit')
                  .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                  .toFixed(2)}৳
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and Filter Section */}
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Transaction ID"
              className="pl-8 pr-3 py-2 border rounded-md text-sm w-full"
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
              className="border rounded-md px-3 py-2 text-sm"
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
              {searchTerm ? 'No transactions match your search' : 'No transactions found'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3 p-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500">{formatDate(tx.createdAt)}</p>
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
                    {tx.paymentMethod && (
                      <div>
                        <p className="text-gray-500">Method:</p>
                        <p className="font-medium">{tx.paymentMethod}</p>
                      </div>
                    )}
                    {tx.transactionId && (
                      <div>
                        <p className="text-gray-500">Transaction ID:</p>
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
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
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
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
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
    </div>
  );
};

export default BalanceStatement;