import React from 'react';

const CallToAction = () => {
  return (
    <div className="bg-gradient-to-r from-[#0A192F] via-[#4C1D95] to-[#FF69B4] py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-10 max-w-3xl mx-auto leading-tight">
          The development of blockchain economy is the historical trend and inevitable choice of today's world
        </h2>
        <button className="bg-pink-200 text-purple-900 px-10 py-4 rounded-full text-lg font-semibold hover:bg-pink-300 transition-colors shadow-lg">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default CallToAction;