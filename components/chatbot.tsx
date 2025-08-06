"use client"

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, HelpCircle, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
  suggestions?: string[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: 'Hi! I\'m your NexTicket assistant! ✨ How can I help you today?', 
      sender: 'bot',
      timestamp: new Date(),
      type: 'suggestion',
      suggestions: ['Find Events', 'Book Tickets', 'Venue Information', 'Account Help']
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('event') || lowerMessage.includes('find')) {
      return {
        id: Date.now(),
        text: 'I can help you find amazing events! 🎉 What type of events are you interested in?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
        suggestions: ['Music Concerts', 'Sports Events', 'Theater Shows', 'Comedy Shows']
      };
    } else if (lowerMessage.includes('book') || lowerMessage.includes('ticket')) {
      return {
        id: Date.now(),
        text: 'Booking tickets is easy! 🎫 You can search for events and select your preferred seats. Would you like me to guide you through the process?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'action',
        suggestions: ['Show me events', 'How to book tickets']
      };
    } else if (lowerMessage.includes('venue')) {
      return {
        id: Date.now(),
        text: 'Looking for venue information? 🏢 I can help you find details about seating, location, and amenities.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'action',
        suggestions: ['Browse Venues', 'Seating Charts', 'Venue Amenities']
      };
    } else if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      return {
        id: Date.now(),
        text: 'Need help with your account? 👤 I can assist with profile settings, order history, and account management.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
        suggestions: ['View Orders', 'Update Profile', 'Security Settings']
      };
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        id: Date.now(),
        text: 'Hello there! 👋 Great to see you! How can I make your NexTicket experience amazing today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
        suggestions: ['Explore Events', 'Get Help', 'Account Info']
      };
    } else {
      return {
        id: Date.now(),
        text: 'I understand you\'re looking for help! 🤔 Let me connect you with the right information. What would you like to know more about?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion',
        suggestions: ['Events', 'Tickets', 'Venues', 'Support']
      };
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);
      
      // Simulate bot thinking time
      setTimeout(() => {
        const botResponse = generateBotResponse(message);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Enhanced Chatbot Toggle Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
              isOpen 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            size="icon"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageCircle className="h-6 w-6 text-white animate-pulse" />
            )}
          </Button>
          
          {/* Notification badge */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
              !
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">NexTicket Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help! ✨</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-white shadow-md'}`}>
                      {msg.sender === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-xs ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-800 shadow-md'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="bg-white shadow-md p-2 rounded-full">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
