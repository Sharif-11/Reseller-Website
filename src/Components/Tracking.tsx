import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrackingStep {
  id: number;
  status: 'completed' | 'active' | 'pending';
  title: string;
  description: string;
  date: string;
  time: string;
}

interface PackageDetails {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  weight: string;
  dimensions: string;
}

const OrderTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  // Mock data fetch - replace with your API call
  useEffect(() => {
    if (trackingNumber) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPackageDetails({
          trackingNumber: trackingNumber,
          carrier: 'FedEx',
          estimatedDelivery: 'Thu, May 25, 2023',
          weight: '2.5 kg',
          dimensions: '30 × 20 × 10 cm'
        });

        // Note: The steps are now sorted with most recent first
        setTrackingSteps([
          {
            id: 5,
            status: 'pending',
            title: 'Delivered',
            description: 'Your package has been delivered',
            date: '',
            time: ''
          },
          {
            id: 4,
            status: 'active',
            title: 'Out for Delivery',
            description: 'Your package is on the delivery vehicle',
            date: 'May 25, 2023',
            time: '8:00 AM'
          },
          {
            id: 3,
            status: 'completed',
            title: 'In Transit',
            description: 'Your package is moving through our network',
            date: 'May 22, 2023',
            time: '9:15 AM'
          },
          {
            id: 2,
            status: 'completed',
            title: 'Shipped',
            description: 'Your package has left our facility and is on its way',
            date: 'May 21, 2023',
            time: '3:45 PM'
          },
          {
            id: 1,
            status: 'completed',
            title: 'Order Processed',
            description: 'Your order has been processed and is being prepared for shipment',
            date: 'May 20, 2023',
            time: '10:30 AM'
          }
        ]);
        setIsLoading(false);
      }, 1500);
    }
  }, [trackingNumber]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      // In a real app, you would call your tracking API here
      console.log('Tracking:', trackingNumber);
    }
  };

  return (
    <div className="py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">আপনার অর্ডার ট্র্যাক করুন</h1>
          <p className="text-base text-md text-gray-600">আপনার ডেলিভারি স্ট্যাটাস চেক করতে ট্র্যাকিং নম্বর লিখুন</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8"
        >
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-grow">
                <label htmlFor="tracking-number" className="sr-only">Tracking Number</label>
                <input
                  type="text"
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="w-full px-4 py-3 text-xs  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tracking...
                  </span>
                ) : 'Track Package'}
              </button>
            </form>
          </div>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12 sm:py-20"
          >
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        )}

        {packageDetails && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Package Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Tracking Number</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{packageDetails.trackingNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Carrier</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{packageDetails.carrier}</p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Estimated Delivery</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-blue-600">{packageDetails.estimatedDelivery}</p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Weight</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{packageDetails.weight}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Dimensions</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{packageDetails.dimensions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Delivery Progress</h2>
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {trackingSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative pl-10 pb-6 sm:pb-8 last:pb-0"
                    >
                      <div className={`absolute -left-0.5 top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-4 ${
                        step.status === 'completed' ? 'bg-green-500 border-green-500' : 
                        step.status === 'active' ? 'bg-blue-500 border-blue-500 animate-pulse' : 
                        'bg-white border-gray-300'
                      }`}></div>
                      <div className={`absolute left-4 top-4 h-full w-0.5 ${
                        index === trackingSteps.length - 1 ? 'hidden' : 
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                      <div className="space-y-1">
                        <h3 className={`text-base sm:text-lg font-medium ${
                          step.status === 'completed' ? 'text-gray-900' : 
                          step.status === 'active' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                        {(step.date || step.time) && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            {step.date} {step.time && `• ${step.time}`}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;