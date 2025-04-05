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
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  pageSize: number;
}

const WithdrawHistory = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    pending: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    completed: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    rejected: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    
  });
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const calculateActualAmount = (amount: string, fee: string) => {
    return (parseFloat(amount) - parseFloat(fee)).toFixed(2);
  };

  const fetchWithdrawHistory = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
    try {
      setLoading(true);
      const response = await getWithdrawHistory({
        status: activeTab,
        page,
        pageSize,
        search: searchTerm
      });
      
      if (response.success && response.data) {
        setRequests(response.data.requests);
        console.log('Fetched requests:', response.data.requests);
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalRequests: response.data.totalRequests,
            pageSize: response.data.pageSize
          }
        }));
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

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        pageSize: newPageSize
      }
    }));
    fetchWithdrawHistory(1, newPageSize);
  };

  useEffect(() => {
    fetchWithdrawHistory();
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        fetchWithdrawHistory(1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchWithdrawHistory(1);
    }
  }, [searchTerm]);

  const handleCancelRequest = async (withdrawId: string) => {
    try {
      setCancellingId(withdrawId);
      const response = await cancelWithdrawRequest(withdrawId);
      
      if (response.success) {
        toast.success('Withdrawal request cancelled successfully');
        setRequests(prev => prev.map(req => 
          req.withdrawId === withdrawId ? { ...req, status: 'cancelled' } : req
        ));
        fetchWithdrawHistory(pagination[activeTab].currentPage);
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
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };

  const showDetailsModal = (request: WithdrawRequest) => {
    setSelectedRequest(request);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  const currentPagination = pagination[activeTab];

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">Withdrawal History</h1>
      
      {/* Filter and Search Section */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex border-b">
          <button
            className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
         
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by phone or Txn ID"
              className="pl-8 pr-3 py-1.5 border rounded-md text-xs md:text-sm w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-2.5 top-2 h-3 w-3 md:h-4 md:w-4 text-gray-400"
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
          
          <select
            value={currentPagination.pageSize}
            onChange={handlePageSizeChange}
            className="border rounded-md px-2 py-1.5 text-xs md:text-sm"
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
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No {activeTab} withdrawal requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3 p-3">
            {requests.map((request) => (
              <div key={request.withdrawId} className="border rounded-lg p-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500">{formatDate(request.requestedAt)}</p>
                    <h3 className="font-medium">{request.walletName} - {request.walletPhoneNo}</h3>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div>
                    <p className="text-gray-500">Amount:</p>
                    <p className="font-medium">{parseFloat(request.amount).toFixed(2)}৳</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fee:</p>
                    <p className="font-medium">{parseFloat(request.transactionFee).toFixed(2)}৳</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Actual:</p>
                    <p className="font-medium">{calculateActualAmount(request.amount, request.transactionFee)}৳</p>
                  </div>
                </div>

                {(request.status === 'completed' || request.status === 'rejected') && (
                  <div className="mt-2">
                    <button 
                      onClick={() => showDetailsModal(request)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>
                )}
                
                {request.status === 'pending' ? (
                  <div className="mt-3">
                    <button
                      onClick={() => handleCancelRequest(request.withdrawId)}
                      disabled={cancellingId === request.withdrawId}
                      className="w-full py-1 px-2 bg-red-50 text-red-600 rounded font-medium disabled:opacity-50"
                    >
                      {cancellingId === request.withdrawId ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-500">
                    Processed: {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.withdrawId}>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{request.walletName}</div>
                      <div className="text-gray-500">{request.walletPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                      {parseFloat(request.amount).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {parseFloat(request.transactionFee).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {calculateActualAmount(request.amount, request.transactionFee)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        {(request.status === 'completed' || request.status === 'rejected') && (
                          <button 
                            onClick={() => showDetailsModal(request)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {request.transactionId || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
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
          
          {/* Pagination */}
          {currentPagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchWithdrawHistory(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchWithdrawHistory(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage === currentPagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPagination.currentPage - 1) * currentPagination.pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPagination.currentPage * currentPagination.pageSize, currentPagination.totalRequests)}</span> of{' '}
                    <span className="font-medium">{currentPagination.totalRequests}</span> requests
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchWithdrawHistory(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (currentPagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPagination.currentPage >= currentPagination.totalPages - 2) {
                        pageNum = currentPagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPagination.currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchWithdrawHistory(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchWithdrawHistory(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === currentPagination.totalPages}
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

{selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">
                Withdrawal Request Details
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status:</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Requested At:</p>
                  <p className="mt-1 text-gray-900">{formatDate(selectedRequest.requestedAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Amount:</p>
                  <p className="mt-1 text-gray-900">{parseFloat(selectedRequest.amount).toFixed(2)}৳</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fee:</p>
                  <p className="mt-1 text-gray-900">{parseFloat(selectedRequest.transactionFee).toFixed(2)}৳</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Actual:</p>
                  <p className="mt-1 text-gray-900 font-medium">
                    {calculateActualAmount(selectedRequest.amount, selectedRequest.transactionFee)}৳
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Wallet:</p>
                <p className="mt-1 text-gray-900">{selectedRequest.walletName} - {selectedRequest.walletPhoneNo}</p>
              </div>

              {selectedRequest.status !== 'pending' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
                      <p className="mt-1 text-gray-900">{selectedRequest.transactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Transaction Phone:</p>
                      <p className="mt-1 text-gray-900">{selectedRequest.transactionPhoneNo || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Processed At:</p>
                    <p className="mt-1 text-gray-900">{selectedRequest.processedAt ? formatDate(selectedRequest.processedAt) : 'N/A'}</p>
                  </div>
                </>
              )}

              {selectedRequest.remarks && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Remarks:</p>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{selectedRequest.remarks}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeDetailsModal}
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

export default WithdrawHistory;