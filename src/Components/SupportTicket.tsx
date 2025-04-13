import { FaHeadset, FaPaperPlane } from 'react-icons/fa';

const SupportTicket = () => {
  return (
    <div className=" bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <FaHeadset className="text-3xl" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">সাপোর্ট টিকেট</h1>
                <p className="opacity-90">আমাদের টিম আপনার সমস্যা সমাধানে প্রস্তুত</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="নাম লিখুন"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="ইমেইল লিখুন"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  বিষয় *
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="বিষয় লিখুন"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  সমস্যার বিস্তারিত *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="আপনার সমস্যা বা প্রশ্নের বিস্তারিত বর্ণনা করুন"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  <FaPaperPlane className="mr-2" />
                  টিকেট সাবমিট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;