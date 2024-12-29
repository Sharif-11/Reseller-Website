import { useState } from "react";

const OTPValidation = () => {
  const [otp, setOtp] = useState(""); // OTP input value
  const [error, setError] = useState(""); // Error message state
  const [isSubmitted, setIsSubmitted] = useState(false); // Flag to track if form is submitted

  // OTP validation logic
  const validateOTP = () => {
    // Example OTP: "123456", you can replace this with API call logic
    const validOTP = "123456"; // In real scenario, this would come from your backend
    if (otp === validOTP) {
      setIsSubmitted(true);
      setError("");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  // Handle OTP input change
  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    validateOTP();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594e] text-center mb-4 sm:mb-6">
          OTP ভেরিফিকেশন
        </h1>

        {isSubmitted ? (
          <div className="text-green-500 text-center font-medium mb-4">
            OTP সফলভাবে যাচাই হয়েছে!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                OTP দিন
              </label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={handleChange}
                maxLength={6}
                placeholder="6 ডিজিটের OTP"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a] transition"
            >
              OTP যাচাই করুন
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPValidation;
