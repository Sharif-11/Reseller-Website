import { useState, useEffect } from 'react';
import { formatDate } from '../utils/date.utils';
import { getAllWithdrawRequestForAdmin } from '../Api/seller.api';
import { approveWithdrawRequestForAdmin, rejectWithdrawRequestForAdmin } from '../Api/admin.api';
import { CopyToClipboard } from 'react-copy-to-clipboard';

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
  status: 'pending' | 'completed' | 'rejected';
}

const AdminWithdrawRequests = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [formData, setFormData] = useState({
    transactionId: '',
    transactionPhoneNo: '',
    remarks: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [copied, setCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const calculateActualAmount = (amount: string, fee: string) => {
    return (parseFloat(amount) - parseFloat(fee)).toFixed(2);
  };

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllWithdrawRequestForAdmin(page);
      
      if (response.success && response.data) {
        setRequests(response.data.requests);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalRequests: response.data.totalRequests
        });
      } else {
        setError(response.message || 'Failed to load withdrawal requests');
      }
    } catch (err) {
      setError('An error occurred while fetching withdrawal requests');
      console.error('Error fetching withdrawal requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests.filter(request => request.status === activeTab);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.userPhoneNo.toLowerCase().includes(term) ||
        request.walletPhoneNo.toLowerCase().includes(term) ||
        (request.transactionId && request.transactionId.toLowerCase().includes(term)))
    }
    
    setFilteredRequests(filtered);
  }, [requests, activeTab, searchTerm]);

  const handleActionClick = (request: WithdrawRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setFormData({
      transactionId: '',
      transactionPhoneNo: '',
      remarks: ''
    });
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      setError(null);
      const response = await approveWithdrawRequestForAdmin({
        id: selectedRequest.withdrawId,
        transactionId: formData.transactionId,
        transactionPhoneNo: formData.transactionPhoneNo,
        remarks: formData.remarks
      });

      if (response.success) {
        setRequests(prev => prev.map(req => 
          req.withdrawId === selectedRequest.withdrawId 
            ? { 
                ...req, 
                status: 'completed',
                transactionId: formData.transactionId,
                transactionPhoneNo: formData.transactionPhoneNo,
                remarks: formData.remarks,
                processedAt: new Date().toISOString()
              } 
            : req
        ));
        closeModal();
       
      } else {
        setError(response.message || 'Failed to approve request');

      }
    } catch (err) {
      setError('Error approving withdrawal request');
      console.error('Error approving withdrawal request:', err);
    } finally {
      setProcessing(false);
       setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      setError(null);
      const response = await rejectWithdrawRequestForAdmin({
        id: selectedRequest.withdrawId,
        remarks: formData.remarks
      });

      if (response.success) {
        setRequests(prev => prev.map(req => 
          req.withdrawId === selectedRequest.withdrawId 
            ? { 
                ...req, 
                status: 'rejected',
                remarks: formData.remarks,
                processedAt: new Date().toISOString()
              } 
            : req
        ));
        closeModal();
        window.location.reload();
      } else {
        setError(response.message || 'Failed to reject request');
      }
    } catch (err) {
      setError('Error rejecting withdrawal request');
      console.error('Error rejecting withdrawal request:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };

  const handleCopy = (_text: string, field: string) => {
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">Withdrawal Requests</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by phone or Txn ID"
            className="pl-8 pr-4 py-2 border rounded-md text-sm w-full md:w-64"
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No {activeTab} withdrawal requests found</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3">
            {filteredRequests.map((request) => (
              <div key={request.withdrawId} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(request.requestedAt)}</p>
                    <h3 className="text-sm font-medium">{request.userName}</h3>
                    <p className="text-xs text-gray-500">{request.userPhoneNo}</p>
                  </div>
                  <div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500 mr-1">Wallet:</p>
                    <p className="text-xs font-medium">{request.walletName}</p>
                  </div>
                  <CopyToClipboard text={request.walletPhoneNo} onCopy={() => handleCopy(request.walletPhoneNo, 'wallet')}>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500 mr-1">Phone:</p>
                      <p className="text-xs font-medium">{request.walletPhoneNo}</p>
                      <span className="ml-1 text-xs text-blue-500 cursor-pointer">
                        {copied === 'wallet' ? 'Copied!' : 'Copy'}
                      </span>
                    </div>
                  </CopyToClipboard>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">Amount:</p>
                    <p className="text-xs font-medium">{parseFloat(request.amount).toFixed(2)}৳</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">Fee:</p>
                    <p className="text-xs font-medium">{parseFloat(request.transactionFee).toFixed(2)}৳</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">Actual:</p>
                    <CopyToClipboard 
                      text={calculateActualAmount(request.amount, request.transactionFee)} 
                      onCopy={() => handleCopy(calculateActualAmount(request.amount, request.transactionFee), 'actual')}
                    >
                      <div className="flex items-center">
                        <p className="text-xs font-medium">
                          {calculateActualAmount(request.amount, request.transactionFee)}৳
                        </p>
                        <span className="ml-1 text-xs text-blue-500 cursor-pointer">
                          {copied === 'actual' ? 'Copied!' : 'Copy'}
                        </span>
                      </div>
                    </CopyToClipboard>
                  </div>
                </div>

                {request.status === 'pending' ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleActionClick(request, 'approve')}
                      className="w-full py-1 px-2 bg-green-50 text-green-600 rounded text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleActionClick(request, 'reject')}
                      className="w-full py-1 px-2 bg-red-50 text-red-600 rounded text-xs font-medium"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">
                      Processed: {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                    </div>
                    {request.transactionId && (
                      <div className="mt-1 flex items-center">
                        <p className="text-xs text-gray-500 mr-1">Txn ID:</p>
                        <p className="text-xs font-medium">{request.transactionId}</p>
                      </div>
                    )}
                    {request.transactionPhoneNo && (
                      <div className="mt-1 flex items-center">
                        <p className="text-xs text-gray-500 mr-1">Txn Phone:</p>
                        <p className="text-xs font-medium">{request.transactionPhoneNo}</p>
                      </div>
                    )}
                    {request.remarks && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">Remarks:</p>
                        <p className="text-xs font-medium">{request.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop View - Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.withdrawId}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                      <div className="text-sm text-gray-500">{request.userPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.walletName}</div>
                      <CopyToClipboard text={request.walletPhoneNo} onCopy={() => handleCopy(request.walletPhoneNo, 'wallet')}>
                        <div className="flex items-center">
                          <div className="text-sm text-gray-500">{request.walletPhoneNo}</div>
                          <span className="ml-1 text-xs text-blue-500 cursor-pointer">
                            {copied === 'wallet' ? 'Copied!' : 'Copy'}
                          </span>
                        </div>
                      </CopyToClipboard>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(request.amount).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(request.transactionFee).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      <CopyToClipboard 
                        text={calculateActualAmount(request.amount, request.transactionFee)} 
                        onCopy={() => handleCopy(calculateActualAmount(request.amount, request.transactionFee), 'actual')}
                      >
                        <div className="flex items-center">
                          {calculateActualAmount(request.amount, request.transactionFee)}৳
                          <span className="ml-1 text-xs text-blue-500 cursor-pointer">
                            {copied === 'actual' ? 'Copied!' : 'Copy'}
                          </span>
                        </div>
                      </CopyToClipboard>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleActionClick(request, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleActionClick(request, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {request.transactionId && (
                            <div className="text-xs">
                              <span className="text-gray-500">Txn ID: </span>
                              {request.transactionId}
                            </div>
                          )}
                          {request.transactionPhoneNo && (
                            <div className="text-xs">
                              <span className="text-gray-500">Txn Phone: </span>
                              {request.transactionPhoneNo}
                            </div>
                          )}
                          {request.remarks && (
                            <div className="text-xs">
                              <span className="text-gray-500">Remarks: </span>
                              {request.remarks}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => fetchRequests(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchRequests(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Action Modal */}
      {actionType && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">
                {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {actionType === 'approve' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Phone No *
                    </label>
                    <input
                      type="text"
                      name="transactionPhoneNo"
                      value={formData.transactionPhoneNo}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks {actionType === 'approve' ? '(Optional)' : ''}
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={processing}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawRequests;