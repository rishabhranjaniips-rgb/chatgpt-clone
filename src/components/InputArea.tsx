import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, X } from 'lucide-react';
import './InputArea.css';

interface InputAreaProps {
  onSendMessage: (message: string, attachment: string | null) => void;
  isGenerating: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachment) && !isGenerating) {
      onSendMessage(input.trim(), attachment);
      setInput('');
      setAttachment(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="input-area-wrapper">
      <div className="input-container">
        {attachment && (
          <div className="attachment-preview">
            <img src={attachment} alt="Attachment" className="attachment-img" />
            <button 
              className="remove-attachment-btn" 
              onClick={() => setAttachment(null)}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className={`input-form ${attachment ? 'has-attachment' : ''}`}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
          >
            <Paperclip size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT..."
            className="message-input"
            rows={1}
            disabled={isGenerating}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={(!input.trim() && !attachment) || isGenerating}
          >
            <SendHorizontal size={20} />
          </button>
        </form>
        <div className="footer-text">
          ChatGPT clone. AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
};
