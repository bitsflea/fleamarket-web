import React from 'react';
import { FaXTwitter, FaTelegram, FaGithub } from "react-icons/fa6";

const Navbar = () => {
  return (
    <nav className="absolute top-0 w-full z-10 p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="Bitsflea" className="h-8" />
          <span className="text-white text-xl ml-3 font-bold">BitsFlea</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {/* <a href="#" className="text-white hover:text-pink-200 transition-colors">Home</a>
          <a href="#" className="text-white hover:text-pink-200 transition-colors">Reuse</a>
          <a href="#" className="text-white hover:text-pink-200 transition-colors">About</a>*/}
          <a href="https://x.com/BitsFleaX" target='_blank' className="text-white hover:text-pink-200 transition-colors">
            <FaXTwitter className="text-white w-6 h-6 text-purple-900" />
          </a>
          <a href="https://t.me/bitsflea" target='_blank' className="text-white hover:text-pink-200 transition-colors">
            <FaTelegram className="text-white w-6 h-6 text-purple-900" />
          </a>
          <a href="https://github.com/bitsflea" target='_blank' className="text-white hover:text-pink-200 transition-colors">
            <FaGithub className="text-white w-6 h-6 text-purple-900" />
          </a>
        </div>

        <button onClick={()=>window.location.href="https://test.bitsflea.com"} className="bg-pink-200 text-purple-900 px-6 py-2 rounded-full hover:bg-pink-300 transition-colors shadow-lg">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;