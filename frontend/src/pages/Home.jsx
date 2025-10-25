import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Directly with
            <span className="text-green-600 block">Local Farmers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            KrishiSetu bridges the gap between farmers and consumers. 
            Fresh, local produce delivered directly from farm to your table.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/register?role=consumer" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
            >
              🛒 Shop Local Produce
            </Link>
            <Link 
              to="/register?role=farmer" 
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl text-lg font-semibold transition duration-200"
            >
              👨‍🌾 Sell Your Produce
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">30-40%</div>
              <div className="text-gray-600">Reduced Food Waste</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">50-70%</div>
              <div className="text-gray-600">Better Farmer Income</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">0km</div>
              <div className="text-gray-600">Food Miles Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Farmers List Produce', desc: 'Local farmers add their fresh products with prices and availability' },
              { step: '2', title: 'Consumers Browse & Order', desc: 'Browse nearby farms, add to cart, and place orders' },
              { step: '3', title: 'Direct Delivery', desc: 'Fresh produce delivered directly from farm to your home' }
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;