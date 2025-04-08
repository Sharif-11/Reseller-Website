import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import districts from "../../public/zillasInfo.json";
import { FiUser, FiPhone, FiMapPin, FiEdit2 } from "react-icons/fi";

const CustomerInformation = () => {
  const [upazillas, setUpazillas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      customerPhone: "",
      customerName: "",
      zilla: "",
      upazilla: "",
      deliveryAddress: "",
      courierCharge: 120,
      advancePaid: false,
      comments: "",
    },
    validationSchema,
    onSubmit: async (values) => {
        console.log(values);
      setIsLoading(true);
      try {
        // await onConfirm(values);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts;
    formik.setFieldValue("zilla", selectedZilla);
    formik.setFieldValue("upazilla", "");
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : []);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <h1 className="text-xl font-bold">কাস্টমার তথ্য</h1>
          <p className="text-indigo-100 mt-1 text-sm">
            অর্ডার সম্পূর্ণ করতে কাস্টমারের তথ্য প্রদান করুন
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={formik.handleSubmit} className="grid md:grid-cols-2 gap-4">
            {/* Customer Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiPhone />
                কাস্টমারের মোবাইল নং (১১ সংখ্যা)*
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.customerPhone && formik.errors.customerPhone ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("customerPhone")}
                placeholder="01XXXXXXXXX"
              />
              {formik.touched.customerPhone && formik.errors.customerPhone && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.customerPhone}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                কাস্টমারের বিকল্প ফোন নম্বর থাকলে ডেলিভারি এড্রেস বক্সে লিখে দিবেন।
              </p>
            </div>

            {/* Customer Report Section */}
            <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <span className="font-medium">কাস্টমার রিপোর্ট:</span>
                <span className="text-blue-600">ডেলিভারিঃ 0</span>
                <span className="text-red-600">রিটার্নঃ 0</span>
              </div>
              <p className="text-xs text-gray-600">
                কাস্টমার রিপোর্ট অনেক গুরুত্বপূর্ণ, রিটার্ন রেশিও বেশি থাকলে ডেলিভারি চার্জ ছাড়া অর্ডার নিবেন না।
              </p>
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
                  formik.touched.customerName && formik.errors.customerName ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("customerName")}
              />
              {formik.touched.customerName && formik.errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.customerName}</p>
              )}
            </div>

            {/* Empty div for grid alignment */}
            <div></div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiMapPin />
                কাস্টমারের জেলা *
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.zilla && formik.errors.zilla ? "border-red-500" : "border-gray-300"
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

            {/* Upazilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কাস্টমারের থানা/এরিয়া *
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.upazilla && formik.errors.upazilla ? "border-red-500" : "border-gray-300"
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

            {/* Delivery Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiEdit2 />
                ডেলিভারির ঠিকানা *
              </label>
              <textarea
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.deliveryAddress && formik.errors.deliveryAddress ? "border-red-500" : "border-gray-300"
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কুরিয়ার চার্জ*
              </label>
              <input
                type="number"
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.courierCharge && formik.errors.courierCharge ? "border-red-500" : "border-gray-300"
                }`}
                {...formik.getFieldProps("courierCharge")}
              />
              {formik.touched.courierCharge && formik.errors.courierCharge && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.courierCharge}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                ঈদ উপলক্ষে সকল কুরিয়ার ১০ টাকা চার্জ বৃদ্ধি করেছে।
              </p>
              <p className="text-gray-500 text-xs mt-1">
                রেগুলার চার্জঃ ঢাকা সিটি ৭০ টাকা, সাব ঢাকা ১০০ টাকা এবং ঢাকার বাহিরে ১২০ টাকা।
              </p>
            </div>

            {/* Advance Paid */}
            <div className="md:col-span-2">
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
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">হাঁ</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="advancePaid"
                    checked={formik.values.advancePaid === false}
                    onChange={() => formik.setFieldValue("advancePaid", false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">না</span>
                </label>
              </div>
              {formik.touched.advancePaid && formik.errors.advancePaid && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.advancePaid}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                আপনি যদি ডেলিভারি চার্জ অগ্রিম নিয়ে থাকেন, তাহলে আমরা চার্জ বাদ দিয়ে শুধু প্রোডাক্টের দাম কালেক্ট করব।
              </p>
            </div>

            {/* Comments */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                কমেন্টস (অপশনাল)
              </label>
              <textarea
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                {...formik.getFieldProps("comments")}
                placeholder="অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading || !formik.isValid}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    কনফার্ম করা হচ্ছে...
                  </>
                ) : (
                  "অর্ডার কনফার্ম করুন"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerInformation;