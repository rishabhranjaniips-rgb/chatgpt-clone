import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import type { Chat, Message } from './types';
import { generateAIResponse } from './puter/api';
import { Menu, X } from 'lucide-react';
import './App.css';

function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem('activeChatId') || null;
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId);
    } else {
      localStorage.removeItem('activeChatId');
    }
  }, [activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleClearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  const handleLogout = () => {
    // Clear local state regardless of auth method
    setChats([]);
    setActiveChatId(null);
    localStorage.clear();

    if (window.puter && window.puter.auth) {
      window.puter.auth.signOut().then(() => {
        window.location.reload();
      }).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const handleSendMessage = async (content: string, attachment: string | null) => {
    let currentChatId = activeChatId;
    let currentChats = [...chats];
    
    // Create a new chat if none is active
    if (!currentChatId) {
      const newChat: Chat = {
        id: uuidv4(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''), // Title based on first message
        messages: [],
        updatedAt: Date.now(),
      };
      currentChats = [newChat, ...chats];
      currentChatId = newChat.id;
      setActiveChatId(newChat.id);
    } else if (activeChat?.messages.length === 0) {
      // Update title of empty chat based on first message
      currentChats = currentChats.map(c => 
        c.id === currentChatId 
          ? { ...c, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') }
          : c
      );
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      attachment: attachment || undefined,
      createdAt: Date.now(),
    };

    // Add user message
    currentChats = currentChats.map(c => 
      c.id === currentChatId 
        ? { ...c, messages: [...c.messages, userMessage], updatedAt: Date.now() }
        : c
    );
    setChats(currentChats);
    setIsGenerating(true);

    // Prepare assistant message placeholder
    const assistantMessageId = uuidv4();
    const assistantMessagePlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    };

    currentChats = currentChats.map(c => 
      c.id === currentChatId 
        ? { ...c, messages: [...c.messages, assistantMessagePlaceholder] }
        : c
    );
    setChats(currentChats);

    // Get current chat messages context
    const currentChatMessages = currentChats.find(c => c.id === currentChatId)?.messages || [];
    
    // Exclude the empty placeholder from context
    const contextMessages = currentChatMessages.slice(0, -1);

    // Stream response
    await generateAIResponse(contextMessages, (chunk) => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === currentChatId) {
          const newMessages = [...c.messages];
          const lastMsgIndex = newMessages.findIndex(m => m.id === assistantMessageId);
          if (lastMsgIndex !== -1) {
            newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], content: chunk };
          }
          return { ...c, messages: newMessages };
        }
        return c;
      }));
    });

    setIsGenerating(false);
  };

  return (
    <div className="app-container">
      {/* Mobile header / Sidebar toggle */}
      <div className="mobile-header">
        <button className="icon-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="font-semibold text-lg">ChatGPT Clone</span>
        <button className="icon-btn" onClick={handleNewChat}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        {sidebarOpen && (
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        )}
        <Sidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={(id) => {
            setActiveChatId(id);
            if (window.innerWidth <= 768) {
              setSidebarOpen(false);
            }
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onClearAllChats={handleClearAllChats}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <ChatArea 
          messages={activeChat?.messages || []} 
          isGenerating={isGenerating} 
        />
        <InputArea 
          onSendMessage={handleSendMessage} 
          isGenerating={isGenerating} 
        />
      </main>
    </div>
  );
}

export default App;
