import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isOwn ? 'bg-pink-200 text-purple-900' : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message.content}</p>
        <span className="text-xs text-gray-500 mt-1 block">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;