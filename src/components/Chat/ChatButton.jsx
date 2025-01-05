import React from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

const ChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 p-4 bg-pink-200 rounded-full shadow-lg hover:bg-pink-300 transition-colors z-50"
      aria-label="Open chat"
    >
      <ChatBubbleLeftIcon className="w-6 h-6 text-purple-900" />
    </button>
  );
};

export default ChatButton;