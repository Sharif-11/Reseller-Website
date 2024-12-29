import { useState } from "react";

const OTPForm = () => {
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSendOTP = (e) => {
    e.preventDefault();
    alert(`OTP sent to: ${mobileNumber}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(135,89,78)] text-center mb-4 sm:mb-6">
          রিসেলার রেজিস্ট্রেশন
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-3 sm:mb-4">
          আপনার মোবাইলে একটি OTP কোড পাঠানো হবে, কোডটি দিয়ে রেজিস্ট্রেশন
          সম্পূর্ণ করুন।
        </p>
        <form onSubmit={handleSendOTP}>
          {/* Mobile Number Input */}
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="mobile"
              className="block text-gray-700 font-medium mb-1 sm:mb-2"
            >
              মোবাইল নম্বর*
            </label>
            <input
              id="mobile"
              type="text"
              placeholder="01XXXXXXXXX"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[rgb(135,89,78)] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[rgb(110,72,63)] transition"
          >
            OTP পাঠান
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPForm;
