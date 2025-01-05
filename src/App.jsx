import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero/Hero';  // Update the import path
import Features from './components/Features';
import CallToAction from './components/CallToAction';
import { ChatButton, ChatWindow } from './components/Chat';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <CallToAction />
      <ChatButton onClick={() => setIsChatOpen(true)} />
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}

export default App;