import React from 'react';

const FeatureCard = ({ title, description, icon: Icon }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transition-transform hover:transform hover:scale-105">
      <div className="inline-block p-4 bg-pink-100 rounded-full mb-6">
        <Icon className="w-8 h-8 text-[#FF69B4]" />
      </div>
      <h3 className="text-2xl font-bold text-[#4C1D95] mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <button className="text-[#FF69B4] font-semibold hover:text-pink-700">
        Read →
      </button>
    </div>
  );
};

export default FeatureCard;