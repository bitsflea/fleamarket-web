import React from 'react';
import PlanetBackground from './PlanetBackground';

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0A192F] via-[#4C1D95] to-[#FF69B4] overflow-hidden">
      <PlanetBackground />
      
      <div className="relative container mx-auto px-4 pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <br></br><br></br><br></br><br></br><br></br>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-12 leading-tight">
            Welcome to BitsFlea<br/>
            She is a flea market
          </h1>
          <button className="bg-pink-200 text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-300 transition-colors shadow-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;