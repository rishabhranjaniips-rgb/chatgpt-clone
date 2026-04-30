import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import type { Message } from '../types';
import './ChatArea.css';

interface ChatAreaProps {
  messages: Message[];
  isGenerating: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isGenerating }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  if (messages.length === 0) {
    return (
      <div className="chat-area empty-state">
        <div className="empty-content">
          <div className="bot-avatar large">
            <Bot size={40} />
          </div>
          <h2>How can I help you today?</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role}`}>
            <div className="message-content-wrapper">
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                {msg.attachment && (
                  <div className="message-attachment">
                    <img src={msg.attachment} alt="Uploaded file" />
                  </div>
                )}
                {msg.role === 'user' ? (
                  <div className="user-text">{msg.content}</div>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="message-row assistant">
            <div className="message-content-wrapper">
              <div className="avatar assistant">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>
    </div>
  );
};
