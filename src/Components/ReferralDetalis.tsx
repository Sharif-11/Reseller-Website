import { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import { FiCopy, FiCheck, FiShare2 } from "react-icons/fi";
import { FaHandHoldingUsd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const ReferralDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          title: "আমার রেফারেল লিংক",
          text: `আমার রেফারেল কোড ${user.referralCode} ব্যবহার করে রেজিস্টার করুন`,
          url: referralLink,
        });
      } else {
        setShowShareOptions(!showShareOptions);
      }
    } catch (err) {
      console.error("শেয়ার করতে সমস্যা:", err);
    }
  };

  const navigateToPassiveIncome = () => {
    navigate("/earnings/passive-income");
  };

  return (
    <div className=" p-2">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-4 text-white shadow-sm mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaHandHoldingUsd className="text-lg" />
              <h1 className="text-lg font-bold">রেফারেল প্রোগ্রাম</h1>
            </div>
           
          </div>
          <p className="text-indigo-100 mt-1 text-xs">
            আপনার কোড শেয়ার করে আয় করুন
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Referral Code */}
          <div className="p-3 border-b">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xs font-medium text-gray-600">আপনার রেফারেল কোড</h2>
              
            </div>
            <div className="flex items-center justify-between bg-indigo-50 p-2 rounded">
              <p className="text-sm font-bold text-indigo-800 truncate mr-2">
                {user.referralCode}
              </p>
              <button
                onClick={copyToClipboard}
                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded flex items-center gap-1"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? "কপি হয়েছে" : "কপি করুন"}
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="p-3 border-b">
            <h2 className="text-xs font-medium text-gray-600 mb-1">শেয়ার করার লিংক</h2>
            <div className="flex flex-col xs:flex-row gap-1">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700 truncate"
              />
              <button
                onClick={shareReferral}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center justify-center gap-1"
              >
                <FiShare2 /> শেয়ার
              </button>
            </div>
          </div>

          {/* Share Options */}
          {showShareOptions && (
            <div className="p-2 bg-gray-50 border-b">
              <div className="grid grid-cols-2 gap-1">
                <a
                  href={`whatsapp://send?text=${encodeURIComponent(
                    `আমার রেফারেল কোড ${user.referralCode} ব্যবহার করে রেজিস্টার করুন: ${referralLink}`
                  )}`}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-center"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    referralLink
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-center"
                >
                  Facebook
                </a>
              </div>
            </div>
          )}

          {/* CTA */}
          {/* <div className="p-3">
            <button
              onClick={navigateToPassiveIncome}
              className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded flex items-center justify-center gap-1"
            >
              আপনার রেফারেল আয় দেখুন <FiArrowRight />
            </button>
          </div> */}
        </div>

        {/* Footer Note */}
        <div className="mt-2 p-2 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-600 text-center">
            রেফারেল প্রোগ্রাম সম্পর্কে বিস্তারিত জানতে{" "}
            <button 
              onClick={navigateToPassiveIncome}
              className="text-indigo-600 font-medium"
            >
              প্যাসিভ ইনকাম প্যানেল
            </button>{" "}
            ভিজিট করুন
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetails;