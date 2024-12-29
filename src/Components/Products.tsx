const ProductsPage = () => {
  const products = [
    {
      id: 1,
      title: "মোবাইল ফোন",
      description:
        "শক্তিশালী এবং স্মার্ট মোবাইল ফোন। দীর্ঘস্থায়ী ব্যাটারি সহ।",
      price: "১০,০০০ টাকা",
      image: "https://via.placeholder.com/200x200?text=Mobile", // Sample image
    },
    {
      id: 2,
      title: "ল্যাপটপ",
      description:
        "হালকা ওজনের এবং শক্তিশালী ল্যাপটপ, দীর্ঘস্থায়ী ব্যাটারি এবং উচ্চ পারফরম্যান্স।",
      price: "৫০,০০০ টাকা",
      image: "https://via.placeholder.com/200x200?text=Laptop", // Sample image
    },
    {
      id: 3,
      title: "হেডফোন",
      description:
        "নতুন ডিজাইনের স্টাইলিশ হেডফোন, উচ্চ মানের সাউন্ড এবং আরামদায়ক ডিজাইন।",
      price: "৩,৫০০ টাকা",
      image: "https://via.placeholder.com/200x200?text=Headphones", // Sample image
    },
    {
      id: 4,
      title: "ফিটনেস ট্র্যাকার",
      description: "আপনার ফিটনেস লক্ষ্য পূরণের জন্য আদর্শ ডিভাইস।",
      price: "৫,০০০ টাকা",
      image: "https://via.placeholder.com/200x200?text=Fitness+Tracker", // Sample image
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-0">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#87594E] text-center mb-6">
          আমাদের পণ্য
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:mx-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#87594E] mb-2">
                  {product.title}
                </h2>
                <p className="text-gray-700 mb-4">{product.description}</p>
                <p className="text-lg font-bold text-[#87594E]">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
