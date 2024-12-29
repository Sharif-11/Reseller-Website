import { ChangeEvent, useState } from "react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`মোবাইল: ${formData.mobileNumber}, পাসওয়ার্ড: ${formData.password}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md my-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(135,89,78)] text-center mb-4 sm:mb-6">
          লগইন করুন
        </h1>
        <form onSubmit={handleLogin}>
          {/* Mobile Number */}
          <div className="mb-4">
            <label
              htmlFor="mobile"
              className="block text-gray-700 font-medium mb-2"
            >
              মোবাইল নম্বর*
            </label>
            <input
              id="mobile"
              type="text"
              name="mobileNumber"
              placeholder="01XXXXXXXXX"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              পাসওয়ার্ড*
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-[rgb(135,89,78)] focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[rgb(135,89,78)] text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-[rgb(110,72,63)] transition"
          >
            লগইন করুন
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            নতুন ব্যবহারকারী?{" "}
            <a
              href="/register"
              className="text-[rgb(135,89,78)] font-medium hover:underline"
            >
              এখানে নিবন্ধন করুন
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            পাসওয়ার্ড ভুলে গেছেন?{" "}
            <a
              href="/forgot-password"
              className="text-[rgb(135,89,78)] font-medium hover:underline"
            >
              পাসওয়ার্ড পুনরুদ্ধার করুন
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
