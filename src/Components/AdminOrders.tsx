import { useState, useEffect } from 'react';
import { 
  getAdminOrders, 
  approveOrder, 
  rejectOrder, 
  cancelOrder, 
  processOrder, 
  shipOrder, 
  completeOrder, 
  returnOrder 
} from '../Api/admin.api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/date.utils';
import { FaCopy, FaFilter, FaTimes } from 'react-icons/fa';

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
  transactionId: string | null;
  transactionVerified: boolean;
  sellerWalletName: string;
  sellerWalletPhoneNo: string;
  adminWalletId: number | null;
  adminWalletName: string | null;
  adminWalletPhoneNo: string | null;
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
  name: string;
  startDate: Date | null;
  endDate: Date | null;
}

const AdminOrders = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    pending: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    approved: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    processing: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    shipped: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
    others: { currentPage: 1, totalPages: 1, totalOrders: 0, pageSize: 10 },
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'processing' | 'shipped' | 'others'>('pending');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    phoneNo: '',
    orderId: '',
    name: '',
    startDate: null,
    endDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'cancel' | 'process' | 'ship' | 'complete' | 'return' | null>(null);
  const [actionData, setActionData] = useState({
    transactionId: '',
    trackingURL: '',
    remarks: '',
    totalAmountPaidByCustomer: ''
  });

  const fetchOrders = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
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
        statusParam = 'completed,cancelled,refunded,returned,rejected';
      }

      const response = await getAdminOrders({
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
        toast.error(response.message || 'অর্ডার লোড করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      toast.error('অর্ডার লোড করতে সমস্যা হয়েছে');
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

    if (searchFilters.name) {
      const searchTerm = searchFilters.name.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.sellerName.toLowerCase().includes(searchTerm)
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
      name: '',
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>সম্পূর্ণ</span>;
      case 'approved':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>অনুমোদিত</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>প্রসেসিং</span>;
      case 'shipped':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>শিপড</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>প্রত্যাখ্যাত</span>;
      case 'refunded':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>ফেরত</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>বাতিল</span>;
      case 'returned':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>রিটার্নড</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>পেন্ডিং</span>;
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const openActionModal = (action: typeof currentAction, order: Order) => {
    setCurrentAction(action);
    setSelectedOrder(order);
    setShowActionModal(true);
    setActionData({
      transactionId: '',
      trackingURL: order.trackingURL || '',
      remarks: '',
      totalAmountPaidByCustomer: ''
    });
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setCurrentAction(null);
    setSelectedOrder(null);
  };

  const handleActionSubmit = async () => {
    if (!selectedOrder) return;

    try {
      let response;
      
      switch (currentAction) {
        case 'approve':
          if (!actionData.transactionId) {
            toast.error('ট্রানজেকশন আইডি প্রয়োজন');
            return;
          }
          response = await approveOrder({
            orderId: selectedOrder.orderId.toString(),
            transactionId: actionData.transactionId
          });
          break;
        
        case 'reject':
          response = await rejectOrder({
            orderId: selectedOrder.orderId.toString(),
            remarks: actionData.remarks || undefined
          });
          break;
        
        case 'cancel':
          response = await cancelOrder({
            orderId: selectedOrder.orderId.toString(),
            remarks: actionData.remarks || undefined
          });
          break;
        
        case 'process':
          response = await processOrder({
            orderId: selectedOrder.orderId.toString()
          });
          break;
        
        case 'ship':
          if (!actionData.trackingURL) {
            toast.error('ট্র্যাকিং URL প্রয়োজন');
            return;
          }
          response = await shipOrder({
            orderId: selectedOrder.orderId.toString(),
            trackingURL: actionData.trackingURL
          });
          break;
        
        case 'complete':
          if (!actionData.totalAmountPaidByCustomer) {
            toast.error('গ্রাহক কর্তৃক প্রদত্ত অর্থের পরিমাণ প্রয়োজন');
            return;
          }
          response = await completeOrder({
            orderId: selectedOrder.orderId.toString(),
            totalAmountPaidByCustomer: parseFloat(actionData.totalAmountPaidByCustomer)
          });
          break;
        
        case 'return':
          response = await returnOrder({
            orderId: selectedOrder.orderId.toString(),
            remarks: actionData.remarks || undefined
          });
          break;
        
        default:
          return;
      }

      if (response.success) {
        toast.success(`অর্ডার ${currentAction} সফলভাবে সম্পন্ন হয়েছে`);
        fetchOrders(pagination[activeTab].currentPage, pagination[activeTab].pageSize);
        closeActionModal();
      } else {
        toast.error(response.message || `অর্ডার ${currentAction} করতে সমস্যা হয়েছে`);
      }
    } catch (error) {
      toast.error(`অর্ডার ${currentAction} করতে সমস্যা হয়েছে`);
      console.error(`Error ${currentAction} order:`, error);
    }
  };

  const currentPagination = pagination[activeTab];

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 md:text-2xl md:mb-6">অর্ডার ম্যানেজমেন্ট</h1>
      
      {/* ট্যাব এবং ফিল্টার সেকশন */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-3 py-2 text-[10px] md:text-sm ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('pending')}
            >
              পেন্ডিং
            </button>
            <button
              className={`px-3 py-2 text-[10px] md:text-sm ${activeTab === 'approved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('approved')}
            >
              অনুমোদিত
            </button>
            <button
              className={`px-3 py-2 text-[10px] md:text-sm ${activeTab === 'processing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('processing')}
            >
              প্রসেসিং
            </button>
            <button
              className={`px-3 py-2 text-[10px] md:text-sm ${activeTab === 'shipped' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('shipped')}
            >
              শিপড
            </button>
            <button
              className={`px-3 py-2 text-[10px] md:text-sm ${activeTab === 'others' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('others')}
            >
              অন্যান্য
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border rounded-md text-xs md:text-sm bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
            >
              {showFilters ? <FaTimes size={12} /> : <FaFilter size={12} />}
              {showFilters ? 'ফিল্টার লুকান' : 'ফিল্টার'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                <input
                  type="text"
                  name="name"
                  value={searchFilters.name}
                  onChange={handleFilterChange}
                  placeholder="গ্রাহক/বিক্রেতার নাম"
                  className="w-full px-3 py-1.5 border rounded-md text-sm"
                />
              </div>
              
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
                    <p className="text-gray-500">বিক্রেতা: {order.sellerName} - {order.sellerPhoneNo}</p>
                    <p className="text-gray-500">গ্রাহক: {order.customerName} - {order.customerPhoneNo}</p>
                  </div>
                  <div>
                    {getStatusBadge(order.orderStatus)}
                    {order.cancelledByUser && (
                      <span className="mt-1 block text-xs text-red-500">বিক্রেতা কর্তৃক বাতিল</span>
                    )}
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
                  
                  {(order.orderStatus === 'pending' || order.orderStatus === 'approved') && (
                    <div>
                      <p className="text-gray-500">বিক্রেতা প্রদেয় ডেলিভারি চার্জ:</p>
                      <p className="font-medium">{parseFloat(order.deliveryChargeMustBePaidBySeller).toFixed(2)}৳</p>
                    </div>
                  )}
                  
                  {order.orderStatus === 'pending' && order.transactionId && (
                    <div>
                      <p className="text-gray-500">ট্রানজেকশন আইডি:</p>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={order.transactionId}
                          readOnly
                          className="text-xs p-1 border rounded flex-1 w-24 truncate"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.transactionId || '');
                            toast.success('ট্রানজেকশন আইডি কপি করা হয়েছে');
                          }}
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                          aria-label="Copy transaction ID"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {order.orderStatus === 'shipped' && order.trackingURL && (
                    <div>
                      <p className="text-gray-500">ট্র্যাকিং লিংক:</p>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={order.trackingURL}
                          readOnly
                          className="text-xs p-1 border rounded flex-1 w-24 truncate"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingURL || '');
                            toast.success('ট্র্যাকিং লিংক কপি করা হয়েছে');
                          }}
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                          aria-label="Copy tracking link"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <button 
                    onClick={() => openDetailsModal(order)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    বিস্তারিত দেখুন
                  </button>
                  
                  <div className="flex gap-2">
                    {order.orderStatus === 'pending' && !order.cancelledByUser && (
                      <>
                        <button
                          onClick={() => openActionModal('approve', order)}
                          className="py-1 px-2 bg-green-50 text-green-600 rounded font-medium text-xs"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => openActionModal('reject', order)}
                          className="py-1 px-2 bg-red-50 text-red-600 rounded font-medium text-xs"
                        >
                          প্রত্যাখ্যান
                        </button>
                      </>
                    )}
                    
                    {(order.orderStatus === 'approved' || order.orderStatus === 'processing') && !order.cancelledByUser && (
                      <button
                        onClick={() => openActionModal('cancel', order)}
                        className="py-1 px-2 bg-red-50 text-red-600 rounded font-medium text-xs"
                      >
                        বাতিল
                      </button>
                    )}
                    
                    {order.orderStatus === 'approved' && !order.cancelledByUser && (
                      <button
                        onClick={() => openActionModal('process', order)}
                        className="py-1 px-2 bg-blue-50 text-blue-600 rounded font-medium text-xs"
                      >
                        প্রসেস
                      </button>
                    )}
                    
                    {order.orderStatus === 'processing' && !order.cancelledByUser && (
                      <button
                        onClick={() => openActionModal('ship', order)}
                        className="py-1 px-2 bg-purple-50 text-purple-600 rounded font-medium text-xs"
                      >
                        শিপ
                      </button>
                    )}
                    
                    {order.orderStatus === 'shipped' && !order.cancelledByUser && (
                      <>
                        <button
                          onClick={() => openActionModal('complete', order)}
                          className="py-1 px-2 bg-green-50 text-green-600 rounded font-medium text-xs"
                        >
                          সম্পূর্ণ
                        </button>
                        <button
                          onClick={() => openActionModal('return', order)}
                          className="py-1 px-2 bg-orange-50 text-orange-600 rounded font-medium text-xs"
                        >
                          রিটার্ন
                        </button>
                      </>
                    )}
                  </div>
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
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">বিক্রেতা</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">গ্রাহক</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">মোট পরিমাণ</th>
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
                      <div className="font-medium">{order.sellerName}</div>
                      <div className="text-gray-500">{order.sellerPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-gray-500">{order.customerPhoneNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                      {parseFloat(order.totalAmount).toFixed(2)}৳
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.orderStatus)}
                        {order.cancelledByUser && (
                          <span className="text-xs text-red-500">এই অর্ডারটি বিক্রেতা কর্তৃক বাতিল করা হয়েছে</span>
                        )}
                        <button 
                          onClick={() => openDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium space-x-2">
                      {order.orderStatus === 'pending' && !order.cancelledByUser && (
                        <>
                          <button
                            onClick={() => openActionModal('approve', order)}
                            className="text-green-600 hover:text-green-800"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => openActionModal('reject', order)}
                            className="text-red-600 hover:text-red-800"
                          >
                            প্রত্যাখ্যান
                          </button>
                        </>
                      )}
                      
                      {(order.orderStatus === 'approved' || order.orderStatus === 'processing') && !order.cancelledByUser && (
                        <button
                          onClick={() => openActionModal('cancel', order)}
                          className="text-red-600 hover:text-red-800"
                        >
                          বাতিল
                        </button>
                      )}
                      
                      {order.orderStatus === 'approved' && !order.cancelledByUser && (
                        <button
                          onClick={() => openActionModal('process', order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          প্রসেস
                        </button>
                      )}
                      
                      {order.orderStatus === 'processing' && !order.cancelledByUser && (
                        <button
                          onClick={() => openActionModal('ship', order)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          শিপ
                        </button>
                      )}
                      
                      {order.orderStatus === 'shipped' && !order.cancelledByUser && (
                        <>
                          <button
                            onClick={() => openActionModal('complete', order)}
                            className="text-green-600 hover:text-green-800"
                          >
                            সম্পূর্ণ
                          </button>
                          <button
                            onClick={() => openActionModal('return', order)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            রিটার্ন
                          </button>
                        </>
                      )}
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
      {showDetailsModal && selectedOrder && (
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
                    <p className="text-sm"><span className="font-medium">
                    ডেলিভারি ঠিকানা:
                      </span> {selectedOrder.deliveryAddress}</p>
                    <p className="text-sm"><span className="font-medium">জেলা/উপজেলা:</span> {selectedOrder.customerZilla}, {selectedOrder.customerUpazilla}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">বিক্রেতা তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">নাম:</span> {selectedOrder.sellerName}</p>
                    <p className="text-sm"><span className="font-medium">ফোন:</span> {selectedOrder.sellerPhoneNo}</p>
                    <p className="text-sm"><span className="font-medium">দোকানের নাম:</span> {selectedOrder.sellerShopName}</p>
                    <p className="text-sm"><span className="font-medium">ব্যালেন্স:</span> {parseFloat(selectedOrder.sellerBalance).toFixed(2)}৳</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">অর্ডার তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">স্ট্যাটাস:</span> {getStatusBadge(selectedOrder.orderStatus)}</p>
                    {selectedOrder.cancelledByUser && (
                        <p className="text-xs text-red-500">
                        এই অর্ডারটি বিক্রেতা কর্তৃক বাতিল করা হয়েছে
                        </p>
                    )}
                    <p className="text-sm"><span className="font-medium">অর্ডার তারিখ:</span> {formatDate(selectedOrder.orderCreatedAt)}</p>
                    <p className="text-sm"><span className="font-medium">আপডেট তারিখ:</span> {formatDate(selectedOrder.orderUpdatedAt)}</p>
                    {selectedOrder.courierName && (
                      <p className="text-sm"><span className="font-medium">কুরিয়ার:</span> {selectedOrder.courierName}</p>
                    )}
                    {selectedOrder.trackingURL && (
                      <div className="mt-1">
                        <p className="text-sm font-medium">ট্র্যাকিং URL:</p>
                        <div className="flex items-center mt-1">
                          <input
                            type="text"
                            value={selectedOrder.trackingURL}
                            readOnly
                            className="flex-1 px-2 py-1 border rounded-l text-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.trackingURL || '');
                              toast.success('ট্র্যাকিং URL কপি করা হয়েছে');
                            }}
                            className="px-2 py-1 bg-gray-100 border-t border-r border-b rounded-r hover:bg-gray-200"
                          >
                            <FaCopy size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">লেনদেন তথ্য</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">ডেলিভারি চার্জ:</span> {parseFloat(selectedOrder.deliveryCharge).toFixed(2)}৳</p>
                    {(selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'approved') && (
                      <p className="text-sm"><span className="font-medium">বিক্রেতা প্রদেয় ডেলিভারি চার্জ:</span> {parseFloat(selectedOrder.deliveryChargeMustBePaidBySeller).toFixed(2)}৳</p>
                    )}
                    {selectedOrder.transactionId && (
                      <div className="mt-1">
                        <p className="text-sm font-medium">ট্রানজেকশন আইডি:</p>
                        <div className="flex items-center mt-1">
                          <input
                            type="text"
                            value={selectedOrder.transactionId}
                            readOnly
                            className="flex-1 px-2 py-1 border rounded-l text-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.transactionId || '');
                              toast.success('ট্রানজেকশন আইডি কপি করা হয়েছে');
                            }}
                            className="px-2 py-1 bg-gray-100 border-t border-r border-b rounded-r hover:bg-gray-200"
                          >
                            <FaCopy size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-sm"><span className="font-medium">ট্রানজেকশন ভেরিফাইড:</span> {selectedOrder.transactionVerified ? 'হ্যাঁ' : 'না'}</p>
                    {selectedOrder.adminWalletName && (
                      <p className="text-sm"><span className="font-medium">অ্যাডমিন ওয়ালেট:</span> {selectedOrder.adminWalletName} - {selectedOrder.adminWalletPhoneNo}</p>
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">কমিশন</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">মোট কমিশন:</span> {parseFloat(selectedOrder.totalCommission).toFixed(2)}৳</p>
                    <p className="text-sm"><span className="font-medium">প্রকৃত কমিশন:</span> {parseFloat(selectedOrder.actualCommission).toFixed(2)}৳</p>
                  </div>
                </div>
              </div>

              {selectedOrder.comments && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">মন্তব্য</h3>
                  <p className="text-sm text-gray-900">{selectedOrder.comments}</p>
                </div>
              )}

              {selectedOrder.remarks && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">মন্তব্য (অ্যাডমিন)</h3>
                  <p className="text-sm text-gray-900">{selectedOrder.remarks}</p>
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

      {/* অ্যাকশন মোডাল */}
      {showActionModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">
                {currentAction === 'approve' && 'অর্ডার অনুমোদন করুন'}
                {currentAction === 'reject' && 'অর্ডার প্রত্যাখ্যান করুন'}
                {currentAction === 'cancel' && 'অর্ডার বাতিল করুন'}
                {currentAction === 'process' && 'অর্ডার প্রসেস করুন'}
                {currentAction === 'ship' && 'অর্ডার শিপ করুন'}
                {currentAction === 'complete' && 'অর্ডার সম্পূর্ণ করুন'}
                {currentAction === 'return' && 'অর্ডার রিটার্ন করুন'}
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      অর্ডার # {selectedOrder.orderId}
                    </h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        গ্রাহক: {selectedOrder.customerName} - {selectedOrder.customerPhoneNo}
                      </p>
                      <p className="mt-1">
                        মোট পরিমাণ: {parseFloat(selectedOrder.totalAmount).toFixed(2)}৳
                      </p>
                      {currentAction === 'approve' && (
                        <p className="mt-1 font-medium text-red-600">
                          বিক্রেতা প্রদেয় ডেলিভারি চার্জ: {parseFloat(selectedOrder.deliveryChargeMustBePaidBySeller).toFixed(2)}৳
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {currentAction === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ট্রানজেকশন আইডি *</label>
                  <input
                    type="text"
                    value={actionData.transactionId}
                    onChange={(e) => setActionData({...actionData, transactionId: e.target.value})}
                    placeholder="ট্রানজেকশন আইডি লিখুন"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  />
                </div>
              )}

              {currentAction === 'ship' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ট্র্যাকিং URL *</label>
                  <input
                    type="text"
                    value={actionData.trackingURL}
                    onChange={(e) => setActionData({...actionData, trackingURL: e.target.value})}
                    placeholder="ট্র্যাকিং URL লিখুন"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  />
                </div>
              )}

              {currentAction === 'complete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">গ্রাহক কর্তৃক প্রদত্ত অর্থের পরিমাণ *</label>
                  <input
                    type="number"
                    value={actionData.totalAmountPaidByCustomer}
                    onChange={(e) => setActionData({...actionData, totalAmountPaidByCustomer: e.target.value})}
                    placeholder="পরিমাণ লিখুন"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  />
                </div>
              )}

              {(currentAction === 'reject' || currentAction === 'cancel' || currentAction === 'return') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                  <textarea
                    value={actionData.remarks}
                    onChange={(e) => setActionData({...actionData, remarks: e.target.value})}
                    placeholder="মন্তব্য লিখুন..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={closeActionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleActionSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {currentAction === 'approve' && 'অনুমোদন করুন'}
                {currentAction === 'reject' && 'প্রত্যাখ্যান করুন'}
                {currentAction === 'cancel' && 'বাতিল করুন'}
                {currentAction === 'process' && 'প্রসেস করুন'}
                {currentAction === 'ship' && 'শিপ করুন'}
                {currentAction === 'complete' && 'সম্পূর্ণ করুন'}
                {currentAction === 'return' && 'রিটার্ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;