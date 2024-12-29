import { useState } from "react";

const RegistrationInfo = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "018XXXXXXXX", // Read-only field
    name: "",
    zilla: "",
    address: "",
    email: "",
    sellerCode: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registration Successful");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#87594e] text-center mb-4 sm:mb-6">
          রেজিস্ট্রেশন তথ্য
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Mobile Number (Read-only) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              মোবাইল নম্বর*
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 focus:outline-none"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">নাম*</label>
            <input
              type="text"
              name="name"
              placeholder="আপনার নাম লিখুন"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Zilla */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              জেলা*
            </label>
            <input
              type="text"
              name="zilla"
              placeholder="আপনার জেলা লিখুন"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.zilla}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ঠিকানা*
            </label>
            <input
              type="text"
              name="address"
              placeholder="আপনার ঠিকানা লিখুন"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              type="email"
              name="email"
              placeholder="আপনার ইমেইল লিখুন (যদি থাকে)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Seller Code */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              সেলার কোড (ঐচ্ছিক)
            </label>
            <input
              type="text"
              name="sellerCode"
              placeholder="আপনার সেলার কোড লিখুন (যদি থাকে)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.sellerCode}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড*
            </label>
            <input
              type="password"
              name="password"
              placeholder="পাসওয়ার্ড দিন"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              পাসওয়ার্ড নিশ্চিত করুন*
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#87594e] focus:outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#87594e] text-white font-medium py-3 rounded-lg hover:bg-[#a0685a] transition"
          >
            রেজিস্ট্রেশন সম্পন্ন করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationInfo;
