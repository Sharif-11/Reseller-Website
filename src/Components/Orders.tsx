import { useState, useEffect } from 'react';
import { getOrders } from '../Api/seller.api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/date.utils';

interface Order {
  orderId: number;
  orderStatus: string;
  orderCreatedAt: string;
  orderUpdatedAt: string;
  cancelledByUser: boolean;
  remarks: string | null;
  sellerId: string;
  sellerName: string;
  sellerPhoneNo: string;
  sellerVerified: boolean;
  sellerShopName: string;
  sellerBalance: string;
  customerName: string;
  customerPhoneNo: string;
  customerZilla: string;
  customerUpazilla: string;
  deliveryAddress: string;
  comments: string;
  courierName: string | null;
  trackingURL: string | null;
  deliveryCharge: string;
  deliveryChargeMustBePaidBySeller: string;
  deliveryChargePaidBySeller: string;
  isDeliveryChargePaidBySeller: boolean;
  transactionId: string;
  transactionVerified: boolean;
  sellerWalletName: string;
  sellerWalletPhoneNo: string;
  adminWalletId: number;
  adminWalletName: string;
  adminWalletPhoneNo: string;
  totalAmount: string;
  totalCommission: string;
  actualCommission: string;
  totalProductBasePrice: string;
  totalProductSellingPrice: string;
  totalProductQuantity: number;
  totalAmountPaidByCustomer: string | null;
  orderProducts: OrderProduct[];
}

interface OrderProduct {
  orderProductId: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  productBasePrice: string;
  productSellingPrice: string;
  productQuantity: number;
  productTotalBasePrice: string;
  productTotalSellingPrice: string;
  selectedOptions: {
    [key: string]: string;
  };
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  pageSize: number;
}

interface SearchFilters {
  phoneNo: string;
  orderId: string;
  startDate: Date | null;
  endDate: Date | null;
}

const Orders = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    all: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    pending: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    processing: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    completed: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    others: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed' | 'others'>('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    phoneNo: '',
    orderId: '',
    startDate: null,
    endDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const fetchOrders = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
    try {
      setLoading(true);
      let statusParam = '';
      
      if (activeTab === 'pending') {
        statusParam = 'pending,approved';
      } else if (activeTab === 'processing') {
        statusParam = 'processing,shipped';
      } else if (activeTab === 'completed') {
        statusParam = 'completed';
      } else if (activeTab === 'others') {
        statusParam = 'rejected,refunded,cancelled';
      }

      const response = await getOrders({
        page,
        pageSize,
        status: statusParam
      });
      
      if (response.success && response.data) {
        setAllOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalOrders: response.data.totalOrders,
            pageSize: response.data.pageSize
          }
        }));
      } else {
        toast.error(response.message || 'Failed to load orders');
      }
    } catch (error) {
      toast.error('An error occurred while fetching orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    if (searchFilters.phoneNo) {
      filtered = filtered.filter(order => 
        order.customerPhoneNo.includes(searchFilters.phoneNo) || 
        order.sellerPhoneNo.includes(searchFilters.phoneNo)
      );
    }

    if (searchFilters.orderId) {
      filtered = filtered.filter(order => 
        order.orderId.toString().includes(searchFilters.orderId)
      );
    }

    if (searchFilters.startDate) {
      filtered = filtered.filter(order => 
        new Date(order.orderCreatedAt) >= searchFilters.startDate!
      );
    }

    if (searchFilters.endDate) {
      filtered = filtered.filter(order => 
        new Date(order.orderCreatedAt) <= searchFilters.endDate!
      );
    }

    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setSearchFilters({
      phoneNo: '',
      orderId: '',
      startDate: null,
      endDate: null,
    });
    setFilteredOrders(allOrders);
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
    fetchOrders(1, newPageSize);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, pagination[activeTab].pageSize]);

  useEffect(() => {
    applyFilters();
  }, [searchFilters, allOrders]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      setCancellingId(orderId);
      // Here you would call your API to cancel the order
      // const response = await cancelOrder(orderId);
      // For now, we'll just simulate it
      
      toast.success('Order cancelled successfully');
      setAllOrders(prev => prev.map(order => 
        order.orderId === orderId ? { ...order, orderStatus: 'cancelled', cancelledByUser: true } : order
      ));
      fetchOrders(pagination[activeTab].currentPage);
    } catch (error) {
      toast.error((error as Error).message || 'Error cancelling order');
    } finally {
      setCancellingId(null);
      setShowCancelConfirmation(false);
      setOrderToCancel(null);
    }
  };

  const openCancelConfirmation = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirmation(true);
  };

  const closeCancelConfirmation = () => {
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>সম্পূর্ণ</span>;
      case 'approved':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>অনুমোদিত</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>প্রক্রিয়াধীন</span>;
      case 'shipped':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>শিপড</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>প্রত্যাখ্যাত</span>;
      case 'refunded':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>ফেরত</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>বাতিল</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>বিচারাধীন</span>;
    }
  };

  const showDetailsModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
  };

  const currentPagination = pagination[activeTab];

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">অর্ডার তালিকা</h1>
      
      {/* ফিল্টার এবং সার্চ সেকশন */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex border-b">
            <button
              className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              সব
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('pending')}
            >
              বিচারাধীন
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'processing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('processing')}
            >
              প্রক্রিয়াধীন
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('completed')}
            >
              সম্পূর্ণ
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${activeTab === 'others' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('others')}
            >
              অন্যান্য
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border rounded-md text-xs md:text-sm bg-gray-100 hover:bg-gray-200"
            >
              {showFilters ? 'ফিল্টার লুকান' : 'ফিল্টার দেখুন'}
            </button>
            
            <select
              value={currentPagination.pageSize}
              onChange={handlePageSizeChange}
              className="border rounded-md px-2 py-1.5 text-xs md:text-sm"
            >
              <option value="5">প্রতি পৃষ্ঠায় ৫টি</option>
              <option value="10">প্রতি পৃষ্ঠায় ১০টি</option>
              <option value="20">প্রতি পৃষ্ঠায় ২০টি</option>
              <option value="50">প্রতি পৃষ্ঠায় ৫০টি</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  name="phoneNo"
                  value={searchFilters.phoneNo}
                  onChange={handleFilterChange}
                  placeholder="ফোন নম্বর দিয়ে খুঁজুন"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অর্ডার আইডি</label>
                <input
                  type="text"
                  name="orderId"
                  value={searchFilters.orderId}
                  onChange={handleFilterChange}
                  placeholder="অর্ডার আইডি দিয়ে খুঁজুন"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শুরুর তারিখ</label>
                <input
                  type="date"
                  name="startDate"
                  value={searchFilters.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setSearchFilters({...searchFilters, startDate: e.target.value ? new Date(e.target.value) : null})}
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শেষ তারিখ</label>
                <input
                  type="date"
                  name="endDate"
                  value={searchFilters.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setSearchFilters({...searchFilters, endDate: e.target.value ? new Date(e.target.value) : null})}
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                রিসেট
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">কোন অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* মোবাইল ভিউ - কার্ড */}
          <div className="md:hidden space-y-3 p-3">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="border rounded-lg p-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500">{formatDate(order.orderCreatedAt)}</p>
                    <h3 className="font-medium">অর্ডার # {order.orderId}</h3>
                    <p className="text-gray-500">{order.customerName} - {order.customerPhoneNo}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div>
                    <p className="text-gray-500">মোট পরিমাণ:</p>
                    <p className="font-medium">{parseFloat(order.totalAmount).toFixed(2)}৳</p>
                  </div>
                  <div>
                    <p className="text-gray-500">পণ্য সংখ্যা:</p>
                    <p className="font-medium">{order.totalProductQuantity} টি</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ডেলিভারি চার্জ:</p>
                    <p className="font-medium">{parseFloat(order.deliveryCharge).toFixed(2)}৳</p>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <button 
                    onClick={() => showDetailsModal(order)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    বিস্তারিত দেখুন
                  </button>
                  
                  {(order.orderStatus === 'pending' || order.orderStatus === 'approved') && !order.cancelledByUser && (
                    <button
                      onClick={() => openCancelConfirmation(order)}
                      disabled={cancellingId === order.orderId}
                      className="py-1 px-2 bg-red-50 text-red-600 rounded font-medium disabled:opacity-50 text-xs"
                    >
                      {cancellingId === order.orderId ? 'বাতিল করা হচ্ছে...' : 'অর্ডার বাতিল করুন'}
                    </button>
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
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">অর্ডার আইডি</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">গ্রাহক</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">মোট পরিমাণ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">পণ্য সংখ্যা</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(order.orderCreatedAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                      #{order.orderId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-gray-500">{order.customerPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                      {parseFloat(order.totalAmount).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {order.totalProductQuantity} টি
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.orderStatus)}
                        <button 
                          onClick={() => showDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {(order.orderStatus === 'pending' || order.orderStatus === 'approved') && !order.cancelledByUser ? (
                        <button
                          onClick={() => openCancelConfirmation(order)}
                          disabled={cancellingId === order.orderId}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {cancellingId === order.orderId ? 'বাতিল হচ্ছে...' : 'বাতিল করুন'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* পেজিনেশন */}
          {currentPagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchOrders(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  পূর্ববর্তী
                </button>
                <button
                  onClick={() => fetchOrders(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage === currentPagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  পরবর্তী
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    দেখানো হচ্ছে <span className="font-medium">{(currentPagination.currentPage - 1) * currentPagination.pageSize + 1}</span> থেকে{' '}
                    <span className="font-medium">{Math.min(currentPagination.currentPage * currentPagination.pageSize, currentPagination.totalOrders)}</span> এর মধ্যে{' '}
                    <span className="font-medium">{currentPagination.totalOrders}</span> টি অর্ডার
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchOrders(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">পূর্ববর্তী</span>
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
                          onClick={() => fetchOrders(pageNum)}
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
                      onClick={() => fetchOrders(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === currentPagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">পরবর্তী</span>
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

      {/* বিস্তারিত মোডাল */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">
                অর্ডার বিস্তারিত (#{selectedOrder.orderId})
              </h2>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">গ্রাহক তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">নাম:</span> {selectedOrder.customerName}</p>
                    <p className="text-sm"><span className="font-medium">ফোন:</span> {selectedOrder.customerPhoneNo}</p>
                    <p className="text-sm"><span className="font-medium">ঠিকানা:</span> {selectedOrder.deliveryAddress}</p>
                    <p className="text-sm"><span className="font-medium">জেলা/উপজেলা:</span> {selectedOrder.customerZilla}, {selectedOrder.customerUpazilla}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">অর্ডার তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">স্ট্যাটাস:</span> {getStatusBadge(selectedOrder.orderStatus)}</p>
                    <p className="text-sm"><span className="font-medium">অর্ডার তারিখ:</span> {formatDate(selectedOrder.orderCreatedAt)}</p>
                    <p className="text-sm"><span className="font-medium">আপডেট তারিখ:</span> {formatDate(selectedOrder.orderUpdatedAt)}</p>
                    {selectedOrder.courierName && (
                      <p className="text-sm"><span className="font-medium">কুরিয়ার:</span> {selectedOrder.courierName}</p>
                    )}
                    {selectedOrder.trackingURL && (
                      <p className="text-sm">
                        <span className="font-medium">ট্র্যাকিং লিঙ্ক:</span>{' '}
                        <a href={selectedOrder.trackingURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          দেখুন
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">পণ্য তালিকা</h3>
                <div className="border rounded-md divide-y">
                  {selectedOrder.orderProducts.map((product) => (
                    <div key={product.orderProductId} className="p-3 flex">
                      <img 
                        src={product.productImage} 
                        alt={product.productName} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium">{product.productName}</h4>
                        <p className="text-sm text-gray-500">
                          {Object.entries(product.selectedOptions).map(([key, value]) => (
                            <span key={key} className="mr-2">{key}: {value}</span>
                          ))}
                        </p>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm">
                            {parseFloat(product.productSellingPrice).toFixed(2)}৳ × {product.productQuantity}
                          </p>
                          <p className="text-sm font-medium">
                            {parseFloat(product.productTotalSellingPrice).toFixed(2)}৳
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">মূল্য বিবরণী</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">পণ্যের মোট মূল্য:</p>
                      <p className="text-sm">{parseFloat(selectedOrder.totalProductSellingPrice).toFixed(2)}৳</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">ডেলিভারি চার্জ:</p>
                      <p className="text-sm">{parseFloat(selectedOrder.deliveryCharge).toFixed(2)}৳</p>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <p className="text-sm font-medium">সর্বমোট:</p>
                      <p className="text-sm font-medium">{parseFloat(selectedOrder.totalAmount).toFixed(2)}৳</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">লেনদেন তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">ট্রানজেকশন আইডি:</span> {selectedOrder.transactionId || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">ওয়ালেট:</span> {selectedOrder.sellerWalletName} - {selectedOrder.sellerWalletPhoneNo}</p>
                    <p className="text-sm"><span className="font-medium">ভেরিফাইড:</span> {selectedOrder.transactionVerified ? 'হ্যাঁ' : 'না'}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.comments && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">মন্তব্য</h3>
                  <p className="text-sm text-gray-900">{selectedOrder.comments}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ক্যান্সেল কনফার্মেশন মোডাল */}
      {showCancelConfirmation && orderToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-red-600">
                অর্ডার বাতিল করুন
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-gray-700">
                আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান?
              </p>
              
              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      অর্ডার # {orderToCancel.orderId}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        গ্রাহক: {orderToCancel.customerName} - {orderToCancel.customerPhoneNo}
                      </p>
                      <p className="mt-1">
                        মোট পরিমাণ: {parseFloat(orderToCancel.totalAmount).toFixed(2)}৳
                      </p>
                      <p className="mt-1">
                        তারিখ: {formatDate(orderToCancel.orderCreatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={closeCancelConfirmation}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => handleCancelOrder(orderToCancel.orderId)}
                disabled={cancellingId === orderToCancel.orderId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingId === orderToCancel.orderId ? 'বাতিল করা হচ্ছে...' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;