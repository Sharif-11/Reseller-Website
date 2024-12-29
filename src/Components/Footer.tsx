const Footer = () => {
  return (
    <footer className="bg-[#87594e] text-white mt-auto py-6 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold">Reseller Bd</h2>
            <p className="mt-2 text-sm">
              Connecting people with products seamlessly.
            </p>
          </div>
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a
              href="#"
              className="text-lg hover:underline hover:text-gray-200 transition"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-lg hover:underline hover:text-gray-200 transition"
            >
              Terms & Conditions
            </a>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">
              Copyright © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
