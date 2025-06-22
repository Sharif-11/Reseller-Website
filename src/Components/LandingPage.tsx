import HomeIntroduction from './CompanyIntro'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div className='flex flex-col'>
      <main className='flex-grow'>
        {/* Hero Introduction */}
        <HomeIntroduction />

        {/* How It Works Section */}
        <section id='how-it-works' className='py-12 md:py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12'>
              কিভাবে কাজ করে?
            </h2>

            <div className='max-w-4xl mx-auto space-y-8 md:space-y-12'>
              {/* Step 1 */}
              <div className='flex flex-col md:flex-row items-center justify-center'>
                <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                  <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                    ১
                  </div>
                </div>
                <div className='text-center md:text-left md:w-2/3'>
                  <h3 className='text-lg md:text-xl font-semibold mb-2'>নিবন্ধন করুন</h3>
                  <p className='text-gray-600 text-sm md:text-base'>
                    শপ বিডি রিসেলার জবস-এ ফ্রি রেজিস্ট্রেশন করুন। মাত্র কয়েক মিনিটে সম্পন্ন হবে
                    আপনার অ্যাকাউন্ট ভেরিফিকেশন।
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='flex flex-col md:flex-row items-center justify-center'>
                <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                  <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                    ২
                  </div>
                </div>
                <div className='text-center md:text-left md:w-2/3'>
                  <h3 className='text-lg md:text-xl font-semibold mb-2'>পণ্য নির্বাচন করুন</h3>
                  <p className='text-gray-600 text-sm md:text-base'>
                    শপ বিডি রিসেলার জবস এর পণ্য ক্যাটালগ ব্রাউজ করুন এবং আপনার পছন্দের পণ্যগুলো
                    নির্বাচন করুন।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='flex flex-col md:flex-row items-center justify-center'>
                <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                  <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                    ৩
                  </div>
                </div>
                <div className='text-center md:text-left md:w-2/3'>
                  <h3 className='text-lg md:text-xl font-semibold mb-2'>বিক্রয় শুরু করুন</h3>
                  <p className='text-gray-600 text-sm md:text-base'>
                    আপনার সোশ্যাল মিডিয়া বা অনলাইন স্টোরে শপ বিডি রিসেলার জবস এর পণ্যগুলো প্রচার
                    করুন। অর্ডার পেলে আমাদেরকে জানান।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
