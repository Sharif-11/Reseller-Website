import { useState, useEffect } from 'react';
import { getWithdrawHistory, cancelWithdrawRequest } from '../Api/seller.api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/date.utils';

interface WithdrawRequest {
  withdrawId: string;
  userId: string;
  userPhoneNo: string;
  userName: string;
  amount: string;
  actualAmount: string;
  transactionFee: string;
  walletName: 'bKash' | 'Nagad';
  walletPhoneNo: string;
  transactionId: string | null;
  transactionPhoneNo: string | null;
  remarks: string | null;
  requestedAt: string;
  processedAt: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

const WithdrawHistory = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0
  });

  const fetchWithdrawHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getWithdrawHistory(page);
      
      if (response.success && response.data) {
        setRequests(response.data.requests);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalRequests: response.data.totalRequests
        });
      } else {
        toast.error(response.message || 'Failed to load withdrawal history');
      }
    } catch (error) {
      toast.error('An error occurred while fetching withdrawal history');
      console.error('Error fetching withdrawal history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawHistory();
  }, []);

  const handleCancelRequest = async (withdrawId: string) => {
    try {
      setCancellingId(withdrawId);
      const response = await cancelWithdrawRequest(withdrawId);
      
      if (response.success) {
        toast.success('Withdrawal request cancelled successfully');
        setRequests(prev => prev.map(req => 
          req.withdrawId === withdrawId ? { ...req, status: 'cancelled' } : req
        ));
      } else {
        throw new Error(response.message || 'Failed to cancel request');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Error cancelling withdrawal request');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">Withdrawal History</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No withdrawal requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4 p-4">
            {requests.map((request) => (
              <div key={request.withdrawId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{formatDate(request.requestedAt)}</p>
                    <h3 className="font-medium">{request.walletName} - {request.walletPhoneNo}</h3>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium">{parseFloat(request.amount).toFixed(2)}৳</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="font-medium">{parseFloat(request.transactionFee).toFixed(2)}৳</p>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleCancelRequest(request.withdrawId)}
                      disabled={cancellingId === request.withdrawId}
                      className="w-full py-1 px-3 bg-red-50 text-red-600 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {cancellingId === request.withdrawId ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.withdrawId}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.walletName}</div>
                      <div className="text-sm text-gray-500">{request.walletPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(request.amount).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(request.transactionFee).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' ? (
                        <button
                          onClick={() => handleCancelRequest(request.withdrawId)}
                          disabled={cancellingId === request.withdrawId}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {cancellingId === request.withdrawId ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination - Works for both mobile and desktop */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchWithdrawHistory(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchWithdrawHistory(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalRequests)}</span> of{' '}
                    <span className="font-medium">{pagination.totalRequests}</span> requests
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchWithdrawHistory(pagination.currentPage - 1)}
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
                          onClick={() => fetchWithdrawHistory(pageNum)}
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
                      onClick={() => fetchWithdrawHistory(pagination.currentPage + 1)}
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
        </div>
      )}
    </div>
  );
};

export default WithdrawHistory;