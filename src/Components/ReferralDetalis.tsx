import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";

export const ReferralDetails = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user?.referralCode) {
    return null; // Do not render if no referral code exists
  }

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold text-center text-gray-700 mb-4">
        আপনার রেফারাল কোড
      </h2>
      <div className="mb-4">
        <p className="text-gray-700 text-center text-lg font-semibold bg-gray-100 p-3 rounded-lg">
          {user.referralCode}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 font-medium">রেফারাল লিংক:</p>
        <div className="flex items-center border rounded-lg p-3 bg-gray-100">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="w-full bg-transparent text-gray-800 outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 px-3 py-1 bg-[#87594e] text-white rounded-md hover:bg-[#a0685a]"
          >
            {copied ? "✅ কপি হয়েছে" : "কপি করুন"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center">
        এই লিংকটি বন্ধুদের সাথে শেয়ার করুন এবং রেফারাল সুবিধা পান!
      </p>
    </div>
  );
};

export default ReferralDetails;
