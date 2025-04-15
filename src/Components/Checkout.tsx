import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiMapPin, FiEdit2, FiChevronLeft, 
  FiDollarSign, FiCreditCard, FiX, FiInfo 
} from 'react-icons/fi';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import districts from '../../public/zillasInfo.json';
import { useAuth } from '../Hooks/useAuth';
import { dhakaDeliveryCharge, negativeLimit, outsideDhakaDeliveryCharge } from '../utils/config.utils';
import { Wallet } from '../Context/userContext';
import { getAdminWallets, getWalletList } from '../Api/seller.api';

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

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user,reloadUser } = useAuth();
  const [upazillas, setUpazillas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [adminWallets, setAdminWallets] = useState<Wallet[]>([]);
  const [sellerWallets, setSellerWallets] = useState<Wallet[]>(user?.wallets || []);
  const [amountToPay, setAmountToPay] = useState(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [paymentFormFilled, setPaymentFormFilled] = useState(false);
  const [showManualWalletInput, setShowManualWalletInput] = useState(false);

  // Cart items and price calculation
  const cartItems = location.state?.cartItems as CartItem[] || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

  // Calculate extra delivery charge based on product count
  const calculateExtraDeliveryCharge = (productCount: number) => {
    if (productCount <= 3) return 0;
    if (productCount === 4) return 10;
    
    // For 5+ products: 10 tk for the 4th product + 5 tk for every 2 additional products
    const additionalProducts = productCount - 4;
    return 10 + Math.floor(additionalProducts / 2) * 5;
  };

  // Fetch admin wallets
  const fetchAdminWallets = async () => {
    try {
      const { success, message, data } = await getAdminWallets();
      if (success) {
        setAdminWallets(data);
      } else {
        console.error(message);
      }
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
    }
  }

  // Fetch seller wallets
  const fetchSellerWallets = async () => {
    try {
      const { success, message, data } = await getWalletList();
      if (success) {
        setSellerWallets(data);
      } else {
        console.error(message);
      }
    } catch (error) {
      console.error('Error fetching seller wallets:', error);
    }
  }

  useEffect(() => {
    fetchAdminWallets();
    fetchSellerWallets();
    reloadUser();
  }, []);

  // Form validation schema
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
    transactionId: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string().required("ট্রানজেকশন আইডি দিন"),
    }),
    senderWallet: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string()
        .matches(/^01\d{9}$/, "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)")
        .required("আপনার ওয়ালেট নাম্বার দিন"),
    }),
    senderWalletType: Yup.string().when('needsPayment', {
      is: true,
      then: () => Yup.string().required("ওয়ালেট টাইপ নির্বাচন করুন"),
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
      transactionId: '',
      senderWallet: '',
      senderWalletType: '',
      comments: '',
      needsPayment: false,
      paymentMethod: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
      
       

        // const orderData = {
        //   customer: values,
        //   products: cartItems,
        //   totalAmount: subtotal + totalDeliveryCharge,
        //   paymentInfo: values.needsPayment ? {
        //     adminWalletId: values.adminWalletId,
        //     method: values.paymentMethod,
        //     transactionId: values.transactionId,
        //     senderWallet: values.senderWallet,
        //     senderWalletType: values.senderWalletType,
        //     requiredAmount: amountToPay,
        //   } : null
        // };
        const orderData={

          customerName: values.customerName,
          customerPhoneNo: values.customerPhone,
          customerZilla: values.zilla,
          customerUpazilla: values.upazilla,
          deliveryAddress: values.deliveryAddress,
          comments: values.comments,

          products: cartItems.map(item => ({
            productId: item.productId,
            productImage: item.imageUrl,
            productQuantity: item.quantity,
            productSellingPrice: item.sellingPrice,
            selectedOptions: item.selectedOptions,

          })),

          isDeliveryChargePaidBySeller: values.needsPayment,
          deliveryChargePaidBySeller: values.needsPayment ? amountToPay : null,
          transactionId: values.transactionId,
          sellerWalletName: values.senderWalletType,
          sellerWalletPhoneNo: values.senderWallet,
          adminWalletId: values.adminWalletId,

        }
        console.log('Order data:', orderData);
        alert(JSON.stringify(orderData));
      } catch (error) {
        console.error('Order submission error:', error);
        setFormErrors(['অর্ডার সাবমিট করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।']);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Handle district change
  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", "");
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  // Handle admin wallet selection
  const handleAdminWalletSelect = (walletId: number) => {
    const selectedWallet = adminWallets.find(w => w.walletId === walletId);
    if (selectedWallet) {
      formik.setFieldValue("adminWalletId", walletId);
      formik.setFieldValue("paymentMethod", selectedWallet.walletName);
      formik.setFieldValue("senderWalletType", selectedWallet.walletName);
      formik.setFieldValue("transactionId", "");
      formik.setFieldValue("senderWallet", "");
      formik.setFieldTouched("adminWalletId", true);
      
      // Reset manual input when admin wallet changes
      setShowManualWalletInput(false);
    }
  };

  // Handle seller wallet selection
  const handleSellerWalletSelect = (walletPhoneNo: string) => {
    formik.setFieldValue("senderWallet", walletPhoneNo);
    formik.setFieldTouched("senderWallet", true);
  };

  // Check payment requirements before confirming order
  const handleConfirmOrder = () => {
    // First validate the basic form fields
    formik.validateForm().then(errors => {
      const basicFields = ['customerPhone', 'customerName', 'zilla', 'upazilla', 'deliveryAddress'];
      const hasBasicErrors = basicFields.some(field => errors[field as keyof typeof errors]);
      
      if (hasBasicErrors) {
        // If basic fields have errors, don't proceed
        return;
      }

      const baseDeliveryCharge = formik.values.zilla.toLowerCase().includes('dhaka') 
        ? dhakaDeliveryCharge 
        : outsideDhakaDeliveryCharge;
      const extraDeliveryCharge = calculateExtraDeliveryCharge(totalItems);
      const totalDeliveryCharge = baseDeliveryCharge + extraDeliveryCharge;

      const currentBalance = user?.balance || 0;
      let needsPayment = false;
      let paymentAmount = 0;

      if (!user?.isVerified) {
        // Unverified user
        if (currentBalance >= totalDeliveryCharge) {
          needsPayment = false;
        } else {
          needsPayment = true;
          paymentAmount = totalDeliveryCharge - currentBalance;
        }
      } else {
        // Verified user
        if (currentBalance >= 0) {
          if (currentBalance >= totalDeliveryCharge) {
            needsPayment = false;
          } else {
            const remainingAfterCharge = currentBalance - totalDeliveryCharge;
            if (remainingAfterCharge >= negativeLimit) {
              needsPayment = false;
            } else {
              needsPayment = true;
              paymentAmount = totalDeliveryCharge - currentBalance;
            }
          }
        } else {
          // Negative balance (for both user types)
          needsPayment = true;
          paymentAmount = totalDeliveryCharge + Math.abs(currentBalance);
        }
      }

      formik.setFieldValue("needsPayment", needsPayment);
      setShowPaymentForm(needsPayment);
      setAmountToPay(paymentAmount);
      
      if (!needsPayment) {
        // If no payment needed, submit directly
        formik.handleSubmit();
      } else {
        // For payment needed case, first validate wallet selection
        formik.validateField('adminWalletId').then(() => {
          if (formik.errors.adminWalletId) {
            // Show error if wallet not selected
            setFormErrors(['অনুগ্রহ করে একটি এডমিন ওয়ালেট নির্বাচন করুন']);
            setTimeout(() => {
              const paymentSection = document.getElementById('payment-section');
              if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          } else if (paymentFormFilled) {
            // If payment form was already filled, submit now
            formik.handleSubmit();
          } else {
            // Scroll to payment section if payment is needed
            setTimeout(() => {
              const paymentSection = document.getElementById('payment-section');
              if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }
        });
      }
    });
  };

  // Check if payment form is filled
  useEffect(() => {
    if (showPaymentForm) {
      const paymentFields = ['adminWalletId', 'transactionId', 'senderWallet'];
      const isPaymentFormValid = paymentFields.every(
        field => !formik.errors[field as keyof typeof formik.errors] && formik.values[field as keyof typeof formik.errors] 
      );
      setPaymentFormFilled(isPaymentFormValid);
    }
  }, [formik.values, formik.errors, showPaymentForm]);

  // Filter seller wallets by selected admin wallet type
  const filteredSellerWallets = sellerWallets.filter(
    wallet => wallet.walletName.toLowerCase() === 
             (adminWallets.find(w => w.walletId === formik.values.adminWalletId)?.walletName.toLowerCase()
  ))

  // Empty cart handling
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

  // Delivery charge calculation
  const baseDeliveryCharge = formik.values.zilla.toLowerCase().includes('dhaka') 
    ? dhakaDeliveryCharge 
    : outsideDhakaDeliveryCharge;
  const extraDeliveryCharge = calculateExtraDeliveryCharge(totalItems);
  const deliveryCharge = baseDeliveryCharge + extraDeliveryCharge;
  const totalAmount = subtotal + deliveryCharge;
  const userBalance = user?.balance || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm"
        >
          <FiChevronLeft className="mr-1" />
          কার্টে ফিরে যান
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">চেকআউট</h1>

        {/* Mobile order summary */}
        <div className="lg:hidden bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">আপনার অর্ডার</h2>
          <div className="border-b pb-3 mb-3">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex items-start py-2">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h6 className='text-sm font-medium'>{item.name}</h6>
                    <p className='text-sm font-medium'>৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}</p>
                  </div>
                  <p className="text-xs text-gray-500">
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

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">মোট পণ্য:</span>
              <span className="text-gray-900">{totalItems} টি</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">পণ্যের মূল্য:</span>
              <span className="text-gray-900">৳{subtotal.toLocaleString('bn-BD')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ডেলিভারি চার্জ:</span>
              <div className="text-right">
                <span className="text-gray-900">৳{baseDeliveryCharge.toLocaleString('bn-BD')}</span>
                {extraDeliveryCharge > 0 && (
                  <span className="text-xs text-gray-500 block">
                    + অতিরিক্ত ৳{extraDeliveryCharge.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between border-t pt-2 font-medium">
              <span>সর্বমোট:</span>
              <span>৳{totalAmount.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          {/* Balance info */}
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              আপনার ব্যালেন্স: ৳{userBalance.toLocaleString('bn-BD')}
            </p>
            {formik.values.needsPayment && (
              <p className="text-xs text-red-600 mt-1">
                পরিশোধ করতে হবে: ৳{amountToPay.toLocaleString('bn-BD')}
              </p>
            )}
          </div>

          {/* Delivery guidelines - Mobile */}
          <div className="mt-4 lg:hidden">
            <div className="bg-blue-50 p-2 rounded-lg">
              <h3 className="text-xs font-medium text-blue-800 mb-1">ডেলিভারি নির্দেশিকা</h3>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                <li>প্রথম অর্ডারের ক্ষেত্রে ডেলিভারি চার্জ অগ্রিম প্রদান বাধ্যতামূলক</li>
                <li>ডেলিভারি কর্মী উপস্থিত থাকা অবস্থায় পণ্য পরীক্ষা করে নিন</li>
                <li>৩টি পণ্য পর্যন্ত সাধারণ ডেলিভারি চার্জ</li>
                <li>৪র্থ পণ্যের জন্য অতিরিক্ত ৳১০</li>
                <li>এরপর প্রতি ২টি পণ্যের জন্য অতিরিক্ত ৳৫</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer information form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h2 className="text-lg font-bold">কাস্টমার তথ্য</h2>
              <p className="text-blue-100 mt-1 text-xs">
                অর্ডার সম্পূর্ণ করতে কাস্টমারের তথ্য প্রদান করুন
              </p>
            </div>

            <div className="p-4">
              {/* Error messages */}
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {formErrors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm flex items-center">
                      <FiX className="mr-1" /> {error}
                    </p>
                  ))}
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Customer phone */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiPhone size={14} />
                    কাস্টমারের মোবাইল নং*
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
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

                {/* Customer name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiUser size={14} />
                    কাস্টমারের নাম*
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
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

                {/* District and upazilla */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FiMapPin size={14} />
                      জেলা*
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
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
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
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

                {/* Delivery address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiEdit2 size={14} />
                    ডেলিভারির ঠিকানা*
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
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
                    শুধুমাত্র ঠিকানা লিখুন, কাস্টমার এর নাম বা মোবাইল নং দেয়া যাবে না।
                  </p>
                </div>

                {/* Delivery charge info */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiDollarSign size={14} />
                    ডেলিভারি চার্জ
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm">
                      {formik.values.zilla.toLowerCase().includes('dhaka') 
                        ? 'ঢাকা শহরের জন্য: ৳80' 
                        : 'ঢাকার বাইরের জন্য: ৳130'}
                    </p>
                    {totalItems > 3 && (
                      <p className="text-sm mt-1">
                        অতিরিক্ত চার্জ: {totalItems}টি পণ্যের জন্য ৳{extraDeliveryCharge.toLocaleString('bn-BD')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment form (shown when needed) */}
                {showPaymentForm && (
                  <div id="payment-section" className="border-t pt-4 mt-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-1">
                      <FiCreditCard size={16} />
                      ডেলিভারি চার্জ পেমেন্ট
                    </h3>

                    {/* Amount to pay */}
                    <div className="mb-3 bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">পরিশোধ করতে হবে:</span>
                        <span className="text-lg font-bold text-blue-700">
                          ৳{amountToPay.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    {/* Admin wallets */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      {/* <h4 className="text-sm font-medium text-blue-800 mb-2">এডমিন ওয়ালেট নম্বরসমূহ*</h4> */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {adminWallets.map((wallet) => (
                          <div 
                            key={wallet.walletId} 
                            className={`border rounded p-2 cursor-pointer text-sm ${
                              formik.values.adminWalletId === wallet.walletId
                                ? 'border-blue-500 bg-blue-100'
                                : 'border-blue-200'
                            }`}
                            onClick={() => handleAdminWalletSelect(wallet.walletId)}
                          >
                            <p className="font-medium">{wallet.walletName}</p>
                            <p className="text-xs">{wallet.walletPhoneNo}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-500 mt-2">
                        উপরের বিকাশ অথবা নগদ  নম্বরে পেমেন্ট করতে পারবেন।
                      </p>
                      {formik.touched.adminWalletId && formik.errors.adminWalletId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.adminWalletId}</p>
                      )}
                    </div>

                    {/* Auto-selected payment method */}
                    {formik.values.paymentMethod && (
                      <div className="mb-3 p-2 bg-gray-100 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">পেমেন্ট মেথড:</span> {formik.values.paymentMethod}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          আপনাকে {formik.values.paymentMethod} এর মাধ্যমে পেমেন্ট করতে হবে
                        </p>
                      </div>
                    )}

                    {/* Seller wallet selection */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        আপনার {formik.values.paymentMethod || 'ওয়ালেট'} মোবাইল নম্বর নির্বাচন করুন*
                        </label>
                      
                      {!showManualWalletInput && (
                        <>
                          <div className="space-y-2 mb-2">
                            {filteredSellerWallets.map((wallet) => (
                              <div
                                key={wallet.walletId}
                                className={`border rounded p-2 cursor-pointer text-sm ${
                                  formik.values.senderWallet === wallet.walletPhoneNo
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200'
                                }`}
                                onClick={() => handleSellerWalletSelect(wallet.walletPhoneNo)}
                              >
                                <p className="font-medium">{wallet.walletName}</p>
                                <p className="text-xs">{wallet.walletPhoneNo}</p>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setShowManualWalletInput(true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            + নতুন ওয়ালেট নম্বর যোগ করুন
                          </button>
                        </>
                      )}

                      {showManualWalletInput && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              formik.touched.senderWallet && formik.errors.senderWallet 
                                ? "border-red-500" 
                                : "border-gray-300"
                            }`}
                            {...formik.getFieldProps("senderWallet")}
                            placeholder={`আপনার ${formik.values.paymentMethod} নম্বর`}
                          />
                          {formik.touched.senderWallet && formik.errors.senderWallet && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.senderWallet}</p>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => setShowManualWalletInput(false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            ← আমার ওয়ালেট থেকে নির্বাচন করুন
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Transaction ID */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ট্রানজেকশন আইডি*
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          formik.touched.transactionId && formik.errors.transactionId 
                            ? "border-red-500" 
                            : "border-gray-300"
                        } ${!formik.values.adminWalletId ? 'bg-gray-100' : ''}`}
                        {...formik.getFieldProps("transactionId")}
                        placeholder="ট্রানজেকশন আইডি দিন"
                        disabled={!formik.values.adminWalletId}
                      />
                      {formik.touched.transactionId && formik.errors.transactionId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.transactionId}</p>
                      )}
                      {!formik.values.adminWalletId && (
                        <p className="text-red-500 text-xs mt-1">প্রথমে একটি এডমিন ওয়ালেট নির্বাচন করুন</p>
                      )}
                    </div>

                    <div className="mt-3 bg-yellow-50 p-2 rounded-lg">
                      <p className="text-xs text-yellow-800 flex items-start">
                        <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
                        অনুগ্রহ করে পেমেন্ট সম্পন্ন করে সঠিক ট্রানজেকশন আইডি দিন। ভুল তথ্য দিলে আপনার অর্ডার বাতিল করা হতে পারে।
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    কমেন্টস (অপশনাল)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    {...formik.getFieldProps("comments")}
                    placeholder="অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
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
                        প্রসেসিং...
                      </>
                    ) : (
                      showPaymentForm && paymentFormFilled ? "অর্ডার কনফার্ম করুন" : 
                      showPaymentForm ? "পেমেন্ট তথ্য দিন" : "অর্ডার কনফার্ম করুন"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop order summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">আপনার অর্ডার</h2>

              <div className="border-b pb-3 mb-3">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex items-start py-2">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-sm font-medium">৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}</p>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট পণ্য:</span>
                  <span className="text-gray-900">{totalItems} টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পণ্যের মূল্য:</span>
                  <span className="text-gray-900">৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <div className="text-right">
                    <span className="text-gray-900">৳{baseDeliveryCharge.toLocaleString('bn-BD')}</span>
                    {extraDeliveryCharge > 0 && (
                      <span className="text-xs text-gray-500 block">
                        + অতিরিক্ত ৳{extraDeliveryCharge.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>সর্বমোট:</span>
                  <span>৳{totalAmount.toLocaleString('bn-BD')}</span>
                </div>
              </div>
                
                
                {/* Balance info */}
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    আপনার ব্যালেন্স: ৳{userBalance.toLocaleString('bn-BD')}
                  </p>
                  {formik.values.needsPayment && (
                    <p className="text-xs text-red-600 mt-1">
                      পরিশোধ করতে হবে: ৳{amountToPay.toLocaleString('bn-BD')}
                    </p>
                  )}
                </div>
                  
                  
                  {/* Delivery guidelines - Desktop */}
                  <div className="mt-4 hidden lg:block">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <h3 className="text-xs font-medium text-blue-800 mb-1">ডেলিভারি নির্দেশিকা</h3>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                        <li>প্রথম অর্ডারের ক্ষেত্রে ডেলিভারি চার্জ অগ্রিম প্রদান বাধ্যতামূলক</li>
                        <li>ডেলিভারি কর্মী উপস্থিত থাকা অবস্থায় পণ্য পরীক্ষা করে নিন</li>
                        <li>৩টি পণ্য পর্যন্ত সাধারণ ডেলিভারি চার্জ</li>
                        <li>৪র্থ পণ্যের জন্য অতিরিক্ত ৳১০</li>
                        <li>এরপর প্রতি ২টি পণ্যের জন্য অতিরিক্ত ৳৫</li>
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
