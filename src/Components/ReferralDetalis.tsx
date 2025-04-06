import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import { FiCopy, FiCheck, FiShare2 } from "react-icons/fi";
import { FaHandHoldingUsd } from "react-icons/fa";

export const ReferralDetails = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  if (!user?.referralCode) {
    return null;
  }

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "আমার রেফারাল লিংক",
          text: "এই লিংক ব্যবহার করে রেজিস্টার করুন এবং আমরা উভয়েই বোনাস পাবো!",
          url: referralLink,
        });
      } else {
        setShowShareOptions(!showShareOptions);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="min-h-[50vh] bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
          <div className="flex items-center justify-center gap-2">
            <FaHandHoldingUsd className="text-2xl" />
            <h1 className="text-2xl font-bold">আপনার রেফারাল সুবিধা</h1>
          </div>
          <p className="text-indigo-100 mt-1 text-sm">
            বন্ধুদের আমন্ত্রণ করুন
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Referral Code */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              আপনার রেফারাল কোড
            </h3>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-indigo-700 tracking-wider">
                {user.referralCode}
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              রেফারাল লিংক
            </h3>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 truncate"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <FiCheck className="text-lg" />
                ) : (
                  <FiCopy className="text-lg" />
                )}
              </button>
              <button
                onClick={shareReferral}
                className="flex items-center justify-center px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Share"
              >
                <FiShare2 className="text-lg text-gray-700" />
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-xs mt-1 text-center">
                লিংক কপি করা হয়েছে!
              </p>
            )}
          </div>

          {/* Share Options (conditional) */}
          {showShareOptions && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                শেয়ার করুন
              </h4>
              <div className="flex gap-2">
                <a
                  href={`whatsapp://send?text=${encodeURIComponent(
                    `আমার রেফারাল লিংক: ${referralLink}`
                  )}`}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-center text-sm"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    referralLink
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-center text-sm"
                >
                  Facebook
                </a>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-700 mb-2">
              রেফারাল সুবিধা
            </h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>প্রতিটি সফল রেফারালের জন্য আপনি বোনাস পাবেন</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>আপনার বন্ধুও পাবে বিশেষ সুবিধা</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>লিমিটেড টাইম অফার</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;