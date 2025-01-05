import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ChatMessage from './ChatMessage';
import { initOrbitDB, getOrbitDB, cleanup } from '../../utils/orbitDB';

const ChatWindow = ({ onClose }) => {
  // const params = new URLSearchParams(window.location.search);
  let uid = localStorage.getItem("uid") ?? Math.floor(Math.random() * 10 ** 8).toString();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [userId] = useState(uid);

  useEffect(() => {
    const initChat = async () => {
      try {
        const db = await initOrbitDB();

        // Load existing messages
        let existingMessages = [];
        for await (const record of db.iterator({ amount: 100 })) {
          // console.log(record)
          existingMessages.push(JSON.parse(record.value))
        }

        setMessages(existingMessages.reverse());
        
        // console.log(db)

        db.events.on('join', async (peerId, heads) => {
          // The peerId of the ipfs1 node.
          console.log("join:", peerId)
        })

        // Subscribe to new messages
        db.events.on('update', (entry) => {
          const newMsg = JSON.parse(entry.payload.value);
          console.log("newMsg:", newMsg)
          setMessages(prev => [...prev, newMsg]);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setIsLoading(false);
      }
    };

    initChat();
    return () => cleanup().catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const db = getOrbitDB();
      const message = {
        content: newMessage.trim(),
        timestamp: Date.now(),
        userId,
      };
      // console.log(db);

      await db.add(JSON.stringify(message));
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-purple-900">Chat Room</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close chat"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="h-96 p-4 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  isOwn={msg.userId === userId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-pink-200 text-purple-900 rounded-full hover:bg-pink-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;