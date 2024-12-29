import { useState } from "react";

const PasswordReset = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  //   const [message, setMessage] = useState("");

  const handleMobileChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle the password reset
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-lg my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594E] text-center mb-4 sm:mb-6">
          পাসওয়ার্ড রিসেট
        </h1>
        <p className="text-center text-gray-700 mb-4">
          পাসওয়ার্ড রিসেট করতে আপনার মোবাইল নম্বর দিন।
        </p>
        <form onSubmit={handleSubmit}>
          {/* Mobile Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              মোবাইল নম্বর*
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={mobileNumber}
              onChange={handleMobileChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594E] focus:outline-none"
              placeholder="আপনার মোবাইল নম্বর দিন"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#87594E] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[#7a4a3e] transition"
          >
            পাসওয়ার্ড রিসেট করুন
          </button>
        </form>

        {/* Message */}
        {/* {message && (
          <div className="mt-4 text-center text-sm text-gray-700">
            <p>{message}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PasswordReset;
