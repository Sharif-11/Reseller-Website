import { useState, useEffect } from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaTruck, FaInfoCircle, FaSearch, FaFilter, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/date.utils';
import { getAdminOrders, approveOrder, rejectOrder, processOrder, shipOrder, completeOrder, returnOrder } from '../Api/admin.api';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'processing' | 'shipped' | 'completed' | 'rejected' | 'cancelled' | 'returned';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  transactionId?: string;
  courierName?: string;
  trackingUrl?: string;
  remarks?: string;
  amountPaid?: number;
}

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  options: Record<string, string>;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'processing' | 'shipped' | 'others'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'process' | 'ship' | 'complete' | 'return' | null>(null);
  const [formData, setFormData] = useState({
    transactionId: '',
    courierName: '',
    trackingUrl: '',
    remarks: '',
    amountPaid: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalOrders: 0
  });

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let statusParam = '';
        
        if (activeTab === 'pending') {
          statusParam = 'pending';
        } else if (activeTab === 'approved') {
          statusParam = 'approved';
        } else if (activeTab === 'processing') {
          statusParam = 'processing';
        } else if (activeTab === 'shipped') {
          statusParam = 'shipped';
        } else if (activeTab === 'others') {
          statusParam = 'completed,rejected,cancelled,returned';
        }

        const response = await getAdminOrders({
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          status: statusParam
        });

        if (response.success) {
          // Transform API response to match our Order interface
          const transformedOrders = response.data.orders.map((order: any) => ({
            id: order.orderId,
            orderNumber: `ORD-${order.orderId}`,
            customerName: order.customerName,
            customerPhone: order.customerPhoneNo,
            totalAmount: parseFloat(order.totalAmount),
            status: order.orderStatus,
            createdAt: order.orderCreatedAt,
            updatedAt: order.orderUpdatedAt,
            items: order.orderProducts.map((item: any) => ({
              id: item.orderProductId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.productQuantity,
              price: parseFloat(item.productSellingPrice),
              options: item.selectedOptions
            })),
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.transactionId ? 'Online Payment' : 'Cash on Delivery',
            transactionId: order.transactionId,
            courierName: order.courierName,
            trackingUrl: order.trackingURL,
            remarks: order.remarks,
            amountPaid: order.totalAmountPaidByCustomer ? parseFloat(order.totalAmountPaidByCustomer) : undefined
          }));

          setOrders(transformedOrders);
          setPagination({
            currentPage: response.data.currentPage,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
            totalOrders: response.data.totalOrders
          });
        } else {
          toast.error(response.message || 'Failed to load orders');
        }
      } catch (error) {
        toast.error('Error loading orders');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, searchTerm, filters, pagination.currentPage]);

  // Update order status
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !actionModal) return;

    try {
      setLoading(true);
      let response;

      switch (actionModal) {
        case 'approve':
          response = await approveOrder({
            orderId: selectedOrder.id.toString(),
            transactionId: formData.transactionId
          });
          break;
        case 'reject':
          response = await rejectOrder({
            orderId: selectedOrder.id.toString(),
            remarks: formData.remarks
          });
          break;
        case 'process':
          response = await processOrder({
            orderId: selectedOrder.id.toString()
          });
          break;
        case 'ship':
          response = await shipOrder({
            orderId: selectedOrder.id.toString(),
            trackingURL: formData.trackingUrl
          });
          break;
        case 'complete':
          response = await completeOrder({
            orderId: selectedOrder.id.toString(),
            totalAmountPaidByCustomer: formData.amountPaid
          });
          break;
        case 'return':
          response = await returnOrder({
            orderId: selectedOrder.id.toString(),
            remarks: formData.remarks
          });
          break;
      }

      if (response?.success) {
        toast.success(response.message || 'Order status updated successfully');
        // Refresh orders after update
        setPagination(prev => ({ ...prev }));
      } else {
        toast.error(response?.message || 'Failed to update order status');
      }
    } catch (error) {
      toast.error('Error updating order status');
      console.error(error);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  // Open action modal
  const openActionModal = (order: Order, action: typeof actionModal) => {
    setSelectedOrder(order);
    setActionModal(action);
    setFormData({
      transactionId: order.transactionId || '',
      courierName: order.courierName || '',
      trackingUrl: order.trackingUrl || '',
      remarks: order.remarks || '',
      amountPaid: order.amountPaid || order.totalAmount
    });
  };

  // Close modal
  const closeModal = () => {
    setSelectedOrder(null);
    setActionModal(null);
    setFormData({
      transactionId: '',
      courierName: '',
      trackingUrl: '',
      remarks: '',
      amountPaid: 0
    });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountPaid' ? parseFloat(value) || 0 : value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><FaCheckCircle className="inline mr-1" /> Completed</span>;
      case 'approved':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><FaCheckCircle className="inline mr-1" /> Approved</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}><FaBox className="inline mr-1" /> Processing</span>;
      case 'shipped':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}><FaTruck className="inline mr-1" /> Shipped</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}><FaTimesCircle className="inline mr-1" /> Rejected</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}><FaTimesCircle className="inline mr-1" /> Cancelled</span>;
      case 'returned':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}><FaTimesCircle className="inline mr-1" /> Returned</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><FaInfoCircle className="inline mr-1" /> Pending</span>;
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
        
        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by order number, customer name or phone"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaFilter /> Filters
            </button>
          </div>
          
          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="Min amount"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="Max amount"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 md:col-span-2 lg:col-span-4 justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow">
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${activeTab === 'approved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${activeTab === 'processing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('processing')}
          >
            Processing
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${activeTab === 'shipped' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('shipped')}
          >
            Shipped
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${activeTab === 'others' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('others')}
          >
            Others
          </button>
        </div>
        
        {/* Order list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FaBox className="inline-block text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No orders found</h3>
            <p className="text-gray-500">No orders match your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">৳{order.totalAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {/* View details button */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Details
                          </button>
                          
                          {/* Status-specific action buttons */}
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(order, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal(order, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {order.status === 'approved' && (
                            <>
                              <button
                                onClick={() => openActionModal(order, 'process')}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => openActionModal(order, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {order.status === 'processing' && (
                            <>
                              <button
                                onClick={() => openActionModal(order, 'ship')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Ship
                              </button>
                              <button
                                onClick={() => openActionModal(order, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {order.status === 'shipped' && (
                            <>
                              <button
                                onClick={() => openActionModal(order, 'complete')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => openActionModal(order, 'return')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Return
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-blue-600">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm font-medium">৳{order.totalAmount.toFixed(2)}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                      
                      {/* Status-specific action buttons */}
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openActionModal(order, 'approve')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(order, 'reject')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {order.status === 'approved' && (
                        <>
                          <button
                            onClick={() => openActionModal(order, 'process')}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => openActionModal(order, 'reject')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {order.status === 'processing' && (
                        <>
                          <button
                            onClick={() => openActionModal(order, 'ship')}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Ship
                          </button>
                          <button
                            onClick={() => openActionModal(order, 'reject')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {order.status === 'shipped' && (
                        <>
                          <button
                            onClick={() => openActionModal(order, 'complete')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => openActionModal(order, 'return')}
                            className="text-sm text-orange-600 hover:text-orange-800"
                          >
                            Return
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center p-4 border-t">
              <div>
                Showing {filteredOrders.length} of {pagination.totalOrders} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1)
                  }))}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({
                    ...prev,
                    currentPage: Math.min(pagination.totalPages, prev.currentPage + 1)
                  }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Order Details - {selectedOrder.orderNumber}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                    <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                    {selectedOrder.transactionId && (
                      <p><span className="font-medium">Transaction ID:</span> {selectedOrder.transactionId}</p>
                    )}
                    {selectedOrder.courierName && (
                      <p><span className="font-medium">Courier:</span> {selectedOrder.courierName}</p>
                    )}
                    {selectedOrder.trackingUrl && (
                      <div>
                        <span className="font-medium">Tracking Link:</span>
                        <div className="flex items-center mt-1">
                          <input
                            type="text"
                            value={selectedOrder.trackingUrl}
                            readOnly
                            className="flex-1 px-3 py-1 border rounded-l-md text-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.trackingUrl || '');
                              toast.success('Tracking link copied');
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded-r-md"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.remarks && (
                      <p><span className="font-medium">Remarks:</span> {selectedOrder.remarks}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Products</h3>
              <div className="border rounded-lg divide-y">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-4 flex">
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      {Object.entries(item.options).map(([key, value]) => (
                        <p key={key} className="text-sm text-gray-500">{key}: {value}</p>
                      ))}
                      <div className="flex justify-between mt-2">
                        <p className="text-sm">৳{item.price.toFixed(2)} × {item.quantity}</p>
                        <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="w-full md:w-1/2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>৳{selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Delivery Charge:</span>
                      <span>৳0.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">৳{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    {selectedOrder.amountPaid && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Amount Paid:</span>
                        <span className="font-bold text-green-600">৳{selectedOrder.amountPaid.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action modal */}
      {actionModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {actionModal === 'approve' && 'Approve Order'}
                {actionModal === 'reject' && 'Reject Order'}
                {actionModal === 'process' && 'Process Order'}
                {actionModal === 'ship' && 'Ship Order'}
                {actionModal === 'complete' && 'Complete Order'}
                {actionModal === 'return' && 'Return Order'} - {selectedOrder.orderNumber}
              </h2>
            </div>
            
            <div className="p-6">
              {actionModal === 'approve' && (
                <div className="space-y-4">
                  <p>Please enter transaction ID to approve this order:</p>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="Transaction ID"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              )}
              
              {(actionModal === 'reject' || actionModal === 'return') && (
                <div className="space-y-4">
                  <p>Reason for {actionModal === 'reject' ? 'rejecting' : 'returning'} this order (optional):</p>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Reason"
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
              )}
              
              {actionModal === 'ship' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Courier Name</label>
                    <input
                      type="text"
                      name="courierName"
                      value={formData.courierName}
                      onChange={handleInputChange}
                      placeholder="Courier name"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Tracking URL</label>
                    <input
                      type="text"
                      name="trackingUrl"
                      value={formData.trackingUrl}
                      onChange={handleInputChange}
                      placeholder="Tracking URL"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Remarks (optional)</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      placeholder="Remarks"
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              
              {actionModal === 'complete' && (
                <div className="space-y-4">
                  <p>Enter the amount paid by customer:</p>
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    placeholder="Amount paid"
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}
              
              {actionModal === 'process' && (
                <p>Are you sure you want to process this order?</p>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                  actionModal === 'approve' ? 'Approve' :
                  actionModal === 'reject' ? 'Reject' :
                  actionModal === 'process' ? 'Process' :
                  actionModal === 'ship' ? 'Ship' :
                  actionModal === 'complete' ? 'Complete' :
                  'Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;