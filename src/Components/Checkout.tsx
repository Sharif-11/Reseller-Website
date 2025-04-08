import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {  FiUser, FiPhone, FiMapPin, FiEdit2, FiChevronLeft } from 'react-icons/fi';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import districts from '../../public/zillasInfo.json';

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
  const [upazillas, setUpazillas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get cart items from navigation state
  const cartItems = location.state?.cartItems as CartItem[] || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

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
    courierCharge: Yup.number()
      .min(0, "চার্জ ঋণাত্মক হতে পারবে না")
      .required("কুরিয়ার চার্জ দিন"),
    advancePaid: Yup.boolean()
      .required("অগ্রিম প্রদান নির্বাচন করুন"),
    comments: Yup.string()
      .max(500, "৫০০ অক্ষরের বেশি হতে পারবে না")
  });

  const formik = useFormik({
    initialValues: {
      customerPhone: '',
      customerName: '',
      zilla: '',
      upazilla: '',
      deliveryAddress: '',
      courierCharge: 120,
      advancePaid: false,
      comments: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Here you would typically send the order to your backend
        const orderData = {
          customer: values,
          products: cartItems,
          totalAmount: subtotal + values.courierCharge
        };
        
        console.log('Order data:', orderData);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate to success page
        navigate('/order-success', { state: { orderData } });
      } catch (error) {
        console.error('Order submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", "");
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
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

        {/* Mobile Order Summary (shown only on small devices) */}
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

            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">ডেলিভারি চার্জ:</span>
              <span className="text-gray-900 text-sm">৳{formik.values.courierCharge.toLocaleString('bn-BD')}</span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-md font-medium">সর্বমোট:</span>
              <span className="text-md font-medium">
                ৳{(subtotal + formik.values.courierCharge).toLocaleString('bn-BD')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
          {/* Customer Information Form - now comes after order summary on mobile */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-xl font-bold">কাস্টমার তথ্য</h2>
              <p className="text-blue-100 mt-1 text-sm">
                অর্ডার সম্পূর্ণ করতে কাস্টমারের তথ্য প্রদান করুন
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* ... (rest of the form remains exactly the same) ... */}
                {/* Customer Phone */}
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

                {/* Customer Name */}
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

                {/* District and Upazilla */}
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

                {/* Delivery Address */}
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

                {/* Courier Charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    কুরিয়ার চার্জ*
                  </label>
                  <input
                    type="number"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      formik.touched.courierCharge && formik.errors.courierCharge 
                        ? "border-red-500" 
                        : "border-gray-300"
                    }`}
                    {...formik.getFieldProps("courierCharge")}
                  />
                  {formik.touched.courierCharge && formik.errors.courierCharge && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.courierCharge}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    রেগুলার চার্জঃ ঢাকা সিটি ৭০ টাকা, সাব ঢাকা ১০০ টাকা এবং ঢাকার বাহিরে ১২০ টাকা।
                  </p>
                </div>

                {/* Advance Paid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    চার্জ অগ্রিম নিয়েছেন?*
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="advancePaid"
                        checked={formik.values.advancePaid === true}
                        onChange={() => formik.setFieldValue("advancePaid", true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">হাঁ</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="advancePaid"
                        checked={formik.values.advancePaid === false}
                        onChange={() => formik.setFieldValue("advancePaid", false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">না</span>
                    </label>
                  </div>
                  {formik.touched.advancePaid && formik.errors.advancePaid && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.advancePaid}</p>
                  )}
                </div>

                {/* Comments */}
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
                    type="submit"
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
                      "অর্ডার কনফার্ম করুন"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - Hidden on mobile (shown above instead) */}
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

                <div className="flex justify-between">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <span className="text-gray-900">৳{formik.values.courierCharge.toLocaleString('bn-BD')}</span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-medium">সর্বমোট:</span>
                  <span className="text-lg font-medium">
                    ৳{(subtotal + formik.values.courierCharge).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div className="mt-6 ">
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