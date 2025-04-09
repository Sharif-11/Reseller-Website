import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiEdit2, FiChevronLeft, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import districts from '../../public/zillasInfo.json';
import { useAuth } from '../Hooks/useAuth';
import { dhakaDeliveryCharge, negativeLimit, outsideDhakaDeliveryCharge } from '../utils/config.utils';

interface CartItem {
  productId: number;
  cartItemId: string;
  name: string;
  imageUrl: string;
  sellingPrice: number;
  basePrice: number;
  quantity: number;
  selectedOptions: Record<string, string>;
}

interface AdminWallet {
  id: number;
  walletName: string;
  accountNumber: string;
  accountType: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upazillas, setUpazillas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [adminWallets, setAdminWallets] = useState<AdminWallet[]>([]);
  const [amountToPay, setAmountToPay] = useState(0);

  // গ্লোবাল কনফিগারেশন
 // কনফিগারযোগ্য নেগেটিভ লিমিট

  // কার্ট আইটেম এবং মূল্য ক্যালকুলেশন
  const cartItems = location.state?.cartItems as CartItem[] || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

  // ব্যাকেন্ড থেকে ডেটা লোড করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        // এডমিন ওয়ালেট ডেটা
        const wallets: AdminWallet[] = [
          { id: 1, walletName: 'Bkash', accountNumber: '017XXXXXXXX', accountType: 'Personal' },
          { id: 2, walletName: 'Nagad', accountNumber: '019XXXXXXXX', accountType: 'Personal' },
          { id: 3, walletName: 'Rocket', accountNumber: '018XXXXXXXX', accountType: 'Personal' }
        ];
        setAdminWallets(wallets);
      } catch (error) {
        console.error('ডেটা লোড করতে সমস্যা:', error);
      }
    };

    fetchData();
  }, []);

  // ফর্ম ভ্যালিডেশন স্কিমা
  const validationSchema = Yup.object({
    customerPhone: Yup.string()
      .matches(/^01\d{9}$/, "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)")
      .required("মোবাইল নম্বর আবশ্যক"),
    customerName: Yup.string()
      .max(48, "নামটি আরও ছোট হতে হবে")
      .required("নাম আবশ্যক"),
    zilla: Yup.string()
      .required("জেলা নির্বাচন করুন")
      .max(48, "জেলার নাম আরও ছোট হতে হবে"),
    upazilla: Yup.string()
      .required("থানা/এলাকা নির্বাচন করুন")
      .max(48, "থানা/এলাকার নাম আরও ছোট হতে হবে"),
    deliveryAddress: Yup.string()
      .max(255, "ঠিকানা আরও ছোট হতে হবে")
      .required("ঠিকানা আবশ্যক"),
    adminWalletId: Yup.number().when('needsPayment', {
      is: true,
      then: () => Yup.number().required("এডমিন ওয়ালেট নির্বাচন করুন"),
    }),
    paymentMethod: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string().required("পেমেন্ট মেথড নির্বাচন করুন"),
    }),
    transactionId: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string().required("ট্রানজেকশন আইডি দিন"),
    }),
    senderWallet: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string().required("আপনার ওয়ালেট নাম্বার দিন"),
    }),
    paidDeliveryCharge: Yup.number().when('needsPayment', {
      is: true,
      then: () => Yup.number()
        .min(amountToPay, `অন্তত ${amountToPay} টাকা প্রদান করতে হবে`)
        .required("প্রদত্ত ডেলিভারি চার্জ লিখুন"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      customerPhone: '',
      customerName: '',
      zilla: '',
      upazilla: '',
      deliveryAddress: '',
      adminWalletId: 0,
      paymentMethod: '',
      transactionId: '',
      senderWallet: '',
      comments: '',
      needsPayment: false,
      paidDeliveryCharge: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const orderData = {
          customer: values,
          products: cartItems,
          totalAmount: subtotal + (values.zilla.toLowerCase().includes('dhaka') ? dhakaDeliveryCharge : outsideDhakaDeliveryCharge),
          paymentInfo: values.needsPayment ? {
            adminWalletId: values.adminWalletId,
            method: values.paymentMethod,
            transactionId: values.transactionId,
            senderWallet: values.senderWallet,
            requiredAmount: amountToPay,
            paidAmount: values.paidDeliveryCharge,
          } : null
        };
        
        console.log('অর্ডার ডেটা:', orderData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        navigate('/order-success', { state: { orderData } });
      } catch (error) {
        console.error('অর্ডার সাবমিশন সমস্যা:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // জেলা পরিবর্তন হলে উপজেলা আপডেট করা
  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", "");
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  // অর্ডার কনফার্ম করার আগে চেক করা
  const handleConfirmOrder = () => {
    const deliveryCharge = formik.values.zilla.toLowerCase().includes('dhaka') ? dhakaDeliveryCharge : outsideDhakaDeliveryCharge;
    const currentBalance = user?.balance || 0;
    let needsPayment = false;
    let paymentAmount = 0;

    if (!user?.isVerified) {
      // আনভেরিফায়েড ইউজার
      if (currentBalance >= deliveryCharge) {
        needsPayment = false;
      } else {
        needsPayment = true;
        paymentAmount = deliveryCharge - currentBalance;
      }
    } else {
      // ভেরিফায়েড ইউজার
      if (currentBalance >= 0) {
        if (currentBalance >= deliveryCharge) {
          needsPayment = false;
        } else {
          const remainingAfterCharge = currentBalance - deliveryCharge;
          if (remainingAfterCharge >= negativeLimit) {
            needsPayment = false;
          } else {
            needsPayment = true;
            paymentAmount = deliveryCharge - (currentBalance - negativeLimit);
          }
        }
      } else {
        // নেগেটিভ ব্যালেন্স (উভয় ইউজারের জন্য)
        needsPayment = true;
        paymentAmount = deliveryCharge + Math.abs(currentBalance);
      }
    }

    formik.setFieldValue("needsPayment", needsPayment);
    formik.setFieldValue("paidDeliveryCharge", paymentAmount);
    setShowPaymentForm(needsPayment);
    setAmountToPay(paymentAmount);
    
    if (!needsPayment) {
      formik.handleSubmit();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">আপনার কার্টে কোনো পণ্য নেই</h2>
          <p className="text-gray-600 mb-6">অর্ডার সম্পূর্ণ করতে কার্টে পণ্য যোগ করুন</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto"
          >
            <FiChevronLeft className="mr-1" />
            পণ্য ব্রাউজ করুন
          </button>
        </div>
      </div>
    );
  }

  // ডেলিভারি চার্জ ক্যালকুলেশন
  const deliveryCharge = formik.values.zilla.toLowerCase().includes('dhaka') ? dhakaDeliveryCharge : outsideDhakaDeliveryCharge;
  const totalAmount = subtotal + deliveryCharge;
  const userBalance = user?.balance || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-xs"
        >
          <FiChevronLeft className="mr-1" />
          কার্টে ফিরে যান
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">চেকআউট</h1>

        {/* মোবাইল অর্ডার সামারি */}
        <div className="lg:hidden bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-md font-medium text-gray-900 mb-4">আপনার অর্ডার</h2>
          <div className="border-b pb-4 mb-4 text-xs">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex items-start py-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="ml-4 flex-1 text-xs">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h6 className='text-xs'>{item.name}</h6>
                    <p className='text-md'>৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    পরিমাণ: {item.quantity} × ৳{item.sellingPrice.toLocaleString('bn-BD')}
                  </p>
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {Object.entries(item.selectedOptions).map(([key, value]) => (
                        <p key={key}>{key}: {value}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-md">
            <div className="flex justify-between text-md">
              <span className="text-gray-600 text-sm">মোট পণ্য:</span>
              <span className="text-gray-900 text-sm">{totalItems} টি</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">পণ্যের মূল্য:</span>
              <span className="text-gray-900 text-sm">৳{subtotal.toLocaleString('bn-BD')}</span>
            </div>
            
            {/* ডেলিভারি চার্জ */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">ডেলিভারি চার্জ:</span>
              <input
                type="text"
                readOnly
                value={`৳${deliveryCharge.toLocaleString('bn-BD')}`}
                className="text-gray-900 text-sm text-right border-none bg-transparent"
              />
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-md font-medium">সর্বমোট:</span>
              <span className="text-md font-medium">
                ৳{totalAmount.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          {/* ব্যালেন্স এবং পেমেন্ট ইনফো */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              আপনার ব্যালেন্স: ৳{userBalance.toLocaleString('bn-BD')}
              {user?.isVerified && (
                <span className="text-xs ml-2">(ভেরিফায়েড ইউজার)</span>
              )}
            </p>
            {formik.values.needsPayment && (
              <p className="text-sm text-red-600 mt-1">
                পরিশোধ করতে হবে: ৳{amountToPay.toLocaleString('bn-BD')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
          {/* কাস্টমার ইনফরমেশন ফর্ম */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-xl font-bold">কাস্টমার তথ্য</h2>
              <p className="text-blue-100 mt-1 text-sm">
                অর্ডার সম্পূর্ণ করতে কাস্টমারের তথ্য প্রদান করুন
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* কাস্টমার ফোন */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiPhone />
                    কাস্টমারের মোবাইল নং (১১ সংখ্যা)*
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      formik.touched.customerPhone && formik.errors.customerPhone 
                        ? "border-red-500" 
                        : "border-gray-300"
                    }`}
                    {...formik.getFieldProps("customerPhone")}
                    placeholder="01XXXXXXXXX"
                  />
                  {formik.touched.customerPhone && formik.errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.customerPhone}</p>
                  )}
                </div>

                {/* কাস্টমার নাম */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiUser />
                    কাস্টমারের নাম*
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      formik.touched.customerName && formik.errors.customerName 
                        ? "border-red-500" 
                        : "border-gray-300"
                    }`}
                    {...formik.getFieldProps("customerName")}
                  />
                  {formik.touched.customerName && formik.errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.customerName}</p>
                  )}
                </div>

                {/* জেলা এবং উপজেলা */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FiMapPin />
                      জেলা*
                    </label>
                    <select
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formik.touched.zilla && formik.errors.zilla 
                          ? "border-red-500" 
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps("zilla")}
                      onChange={handleZillaChange}
                    >
                      <option value="">জেলা নির্বাচন করুন</option>
                      {Object.keys(districts).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {formik.touched.zilla && formik.errors.zilla && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.zilla}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      থানা/এলাকা*
                    </label>
                    <select
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formik.touched.upazilla && formik.errors.upazilla 
                          ? "border-red-500" 
                          : "border-gray-300"
                      }`}
                      {...formik.getFieldProps("upazilla")}
                      disabled={!formik.values.zilla}
                    >
                      <option value="">থানা/এলাকা নির্বাচন করুন</option>
                      {upazillas.map((upazilla) => (
                        <option key={upazilla} value={upazilla}>
                          {upazilla}
                        </option>
                      ))}
                    </select>
                    {formik.touched.upazilla && formik.errors.upazilla && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.upazilla}</p>
                    )}
                  </div>
                </div>

                {/* ডেলিভারি ঠিকানা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiEdit2 />
                    ডেলিভারির ঠিকানা*
                  </label>
                  <textarea
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      formik.touched.deliveryAddress && formik.errors.deliveryAddress 
                        ? "border-red-500" 
                        : "border-gray-300"
                    }`}
                    {...formik.getFieldProps("deliveryAddress")}
                  />
                  {formik.touched.deliveryAddress && formik.errors.deliveryAddress && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.deliveryAddress}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    এখানে শুধু মাত্র ঠিকানা লিখবেন, কাস্টমার এর নাম বা মোবাইল নং এখানে দেয়া যাবে না।
                  </p>
                </div>

                {/* ডেলিভারি চার্জ ডিসপ্লে */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiDollarSign />
                    ডেলিভারি চার্জ
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`৳${deliveryCharge.toLocaleString('bn-BD')}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {formik.values.zilla.toLowerCase().includes('dhaka') 
                      ? 'ঢাকা শহরের জন্য: ৳80' 
                      : 'ঢাকার বাইরের জন্য: ৳130'}
                  </p>
                </div>

                {/* পেমেন্ট ফর্ম (প্রয়োজন হলে শো করা) */}
                {showPaymentForm && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FiCreditCard />
                      ডেলিভারি চার্জ পেমেন্ট
                    </h3>

                    {/* পরিশোধযোগ্য অর্থ */}
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">পরিশোধযোগ্য অর্থ:</span>
                        <input
                          type="text"
                          readOnly
                          value={`৳${amountToPay.toLocaleString('bn-BD')}`}
                          className="font-bold text-right border-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* এডমিন ওয়ালেট নম্বর */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">এডমিন ওয়ালেট নম্বরসমূহ</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {adminWallets.map((wallet) => (
                          <div key={wallet.id} className="border border-blue-200 rounded p-2">
                            <p className="font-medium">{wallet.walletName}</p>
                            <p className="text-sm">{wallet.accountNumber}</p>
                            <p className="text-xs text-gray-500">{wallet.accountType}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          অনুগ্রহ করে এডমিন ওয়ালেট নম্বরের সাথে আপনার পেমেন্ট মেথড অনুযায়ী টাকা পাঠান।
                        </p>
                      </div>
                    </div>

                    {/* প্রদত্ত ডেলিভারি চার্জ */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        প্রদত্ত ডেলিভারি চার্জ*
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap">৳</span>
                        <input
                          type="number"
                          className={`w-full px-4 py-3 border rounded-lg ${
                            formik.touched.paidDeliveryCharge && formik.errors.paidDeliveryCharge 
                              ? "border-red-500" 
                              : "border-gray-300"
                          }`}
                          {...formik.getFieldProps("paidDeliveryCharge")}
                          value={formik.values.paidDeliveryCharge || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            formik.setFieldValue("paidDeliveryCharge", value);
                          }}
                          min={amountToPay}
                        />
                      </div>
                      {formik.touched.paidDeliveryCharge && formik.errors.paidDeliveryCharge && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.paidDeliveryCharge}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        ন্যূনতম পরিশোধযোগ্য: ৳{amountToPay.toLocaleString('bn-BD')}
                        {formik.values.paidDeliveryCharge > amountToPay && (
                          <span className="text-green-600 ml-2">
                            (অতিরিক্ত প্রদত্ত: ৳{(formik.values.paidDeliveryCharge - amountToPay).toLocaleString('bn-BD')})
                          </span>
                        )}
                      </p>
                    </div>

                    {/* এডমিন ওয়ালেট নির্বাচন */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        এডমিনের কোন ওয়ালেটে টাকা পাঠাবেন?*
                      </label>
                      <select
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formik.touched.adminWalletId && formik.errors.adminWalletId 
                            ? "border-red-500" 
                            : "border-gray-300"
                        }`}
                        {...formik.getFieldProps("adminWalletId")}
                      >
                        <option value="">এডমিন ওয়ালেট নির্বাচন করুন</option>
                        {adminWallets.map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.walletName} - {wallet.accountNumber}
                          </option>
                        ))}
                      </select>
                      {formik.touched.adminWalletId && formik.errors.adminWalletId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.adminWalletId}</p>
                      )}
                    </div>

                    {/* পেমেন্ট মেথড */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        পেমেন্ট মেথড*
                      </label>
                      <select
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formik.touched.paymentMethod && formik.errors.paymentMethod 
                            ? "border-red-500" 
                            : "border-gray-300"
                        }`}
                        {...formik.getFieldProps("paymentMethod")}
                      >
                        <option value="">পেমেন্ট মেথড নির্বাচন করুন</option>
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                      </select>
                      {formik.touched.paymentMethod && formik.errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.paymentMethod}</p>
                      )}
                    </div>

                    {/* ট্রানজেকশন আইডি */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ট্রানজেকশন আইডি*
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formik.touched.transactionId && formik.errors.transactionId 
                            ? "border-red-500" 
                            : "border-gray-300"
                        }`}
                        {...formik.getFieldProps("transactionId")}
                        placeholder="TX123456789"
                      />
                      {formik.touched.transactionId && formik.errors.transactionId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.transactionId}</p>
                      )}
                    </div>

                    {/* সেন্ডার ওয়ালেট */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        আপনার ওয়ালেট নাম্বার*
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formik.touched.senderWallet && formik.errors.senderWallet 
                            ? "border-red-500" 
                            : "border-gray-300"
                        }`}
                        {...formik.getFieldProps("senderWallet")}
                        placeholder="01XXXXXXXXX"
                      />
                      {formik.touched.senderWallet && formik.errors.senderWallet && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.senderWallet}</p>
                      )}
                    </div>

                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        অনুগ্রহ করে পেমেন্ট সম্পন্ন করে সঠিক ট্রানজেকশন আইডি দিন। ভুল তথ্য দিলে আপনার অর্ডার বাতিল করা হতে পারে।
                      </p>
                    </div>
                  </div>
                )}

                {/* কমেন্টস */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    কমেন্টস (অপশনাল)
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    {...formik.getFieldProps("comments")}
                    placeholder="অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting || !formik.isValid}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        অর্ডার কনফার্ম করা হচ্ছে...
                      </>
                    ) : (
                      showPaymentForm ? "পেমেন্ট করে অর্ডার কনফার্ম করুন" : "অর্ডার কনফার্ম করুন"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ডেস্কটপ অর্ডার সামারি */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">আপনার অর্ডার</h2>

              <div className="border-b pb-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex items-start py-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p>৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        পরিমাণ: {item.quantity} × ৳{item.sellingPrice.toLocaleString('bn-BD')}
                      </p>
                      {Object.entries(item.selectedOptions).length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট পণ্য:</span>
                  <span className="text-gray-900">{totalItems} টি</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">পণ্যের মূল্য:</span>
                  <span className="text-gray-900">৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>

                {/* ডেলিভারি চার্জ ডিসপ্লে */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <input
                    type="text"
                    readOnly
                    value={`৳${deliveryCharge.toLocaleString('bn-BD')}`}
                    className="text-gray-900 text-right border-none bg-transparent"
                  />
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-medium">সর্বমোট:</span>
                  <span className="text-lg font-medium">
                    ৳{totalAmount.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* ব্যালেন্স এবং পেমেন্ট ইনফো */}
              <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  আপনার ব্যালেন্স: ৳{userBalance.toLocaleString('bn-BD')}
                  {user?.isVerified && (
                    <span className="text-xs ml-2">(ভেরিফায়েড ইউজার)</span>
                  )}
                </p>
                {user?.isVerified && (
                  <p className="text-xs text-yellow-700 mt-1">
                    নেগেটিভ লিমিট: ৳{negativeLimit.toLocaleString('bn-BD')}
                  </p>
                )}
                {showPaymentForm && (
                  <p className="text-sm text-red-600 mt-2">
                    পরিশোধ করতে হবে: ৳{amountToPay.toLocaleString('bn-BD')}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">ডেলিভারি নির্দেশিকা</h3>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>ডেলিভারি সময়সীমা: ২-৫ কার্যদিবস</li>
                    <li>প্রথম অর্ডারের ক্ষেত্রে ডেলিভারি চার্জ অগ্রিম প্রদান বাধ্যতামূলক</li>
                    <li>ডেলিভারি কর্মী উপস্থিত থাকা অবস্থায় পণ্য পরীক্ষা করে নিন</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;