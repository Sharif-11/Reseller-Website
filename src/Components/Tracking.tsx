import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import CourierTracker, { TrackingResponse } from '../utils/CourierTracker';
import { fetchTrackingInfo } from '../Api/tracking.api';



const courierOptions = [
  { value: 'Pathao', label: 'Pathao' },
  { value: 'Steadfast', label: 'Steadfast' },
  { value: 'Redx', label: 'Redx' },
  { value: 'Sundarban', label: 'Sundarban' },
  { value: 'Paperfly', label: 'Paperfly' },
];

const OrderTracking = () => {
  const location = useLocation();
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResponse, setTrackingResponse] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState('');

  // Check for tracking info in location state on component mount
  useEffect(() => {
    if (location.state?.trackingUrl) {
      const trackingInfo = CourierTracker.parseTrackingInfo(location.state.trackingUrl);
      if (trackingInfo) {
        setCourier(trackingInfo.courier);
        setTrackingNumber(trackingInfo.trackingNumber);
        fetchTrackingData(trackingInfo.courier, trackingInfo.trackingNumber);
      }
    } else if (location.state?.trackingInfo) {
      const { courier, trackingNumber } = location.state.trackingInfo;
      setCourier(courier);
      setTrackingNumber(trackingNumber);
      fetchTrackingData(courier, trackingNumber);
    }
  }, [location.state]);

  const fetchTrackingData = async (courier: string, trackingNum: string) => {
    setIsLoading(true);
    setError('');
    const trackingUrl= CourierTracker.getTrackingUrl(courier, trackingNum);
    try {
       const {message,success,data}=await fetchTrackingInfo(trackingUrl);
       if(success){
        setTrackingResponse(data);
        setIsLoading(false);
       }
        else{
          setError(message);
          setIsLoading(false);
        }

    } catch (error) {
      
    }
    
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (courier && trackingNumber.trim()) {
      fetchTrackingData(courier, trackingNumber);
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
          <p className="text-base text-md text-gray-600">কুরিয়ার সিলেক্ট করে ট্র্যাকিং আইডি লিখুন</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8"
        >
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleTrack} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courier" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    কুরিয়ার সিলেক্ট করুন
                  </label>
                  <select
                    id="courier"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Courier</option>
                    {courierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tracking-number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    ট্র্যাকিং নম্বর
                  </label>
                  <input
                    type="text"
                    id="tracking-number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter your tracking number"
                    className="w-full px-4 py-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed self-center sm:self-end"
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

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {trackingResponse && !isLoading && trackingResponse.success && (
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
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Courier</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{trackingResponse.courier}</p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Tracking Number</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{trackingResponse.trackingNumber || trackingNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500">Current Status</h3>
                    <p className="mt-1 text-base sm:text-lg font-medium text-blue-600">{trackingResponse.status}</p>
                  </div>
                  {trackingResponse.estimatedDelivery && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Estimated Delivery</h3>
                      <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{trackingResponse.estimatedDelivery}</p>
                    </div>
                  )}
                  {trackingResponse.weight && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Weight</h3>
                      <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{trackingResponse.weight}</p>
                    </div>
                  )}
                  {trackingResponse.dimensions && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500">Dimensions</h3>
                      <p className="mt-1 text-base sm:text-lg font-medium text-gray-900">{trackingResponse.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Delivery Progress</h2>
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {trackingResponse.steps.map((step, index) => (
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
                        index === trackingResponse.steps.length - 1 ? 'hidden' : 
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