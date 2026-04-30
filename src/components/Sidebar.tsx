import { useState } from 'react';
import { Plus, MessageSquare, Trash2, User, MoreHorizontal, LogOut } from 'lucide-react';
import type { Chat } from '../types';
import './Sidebar.css';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onClearAllChats: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAllChats,
  onLogout
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>New chat</span>
          </div>
        </button>
      </div>
      
      <div className="chat-list">
        {chats.length === 0 && (
          <div className="no-chats text-sm text-secondary">
            No history yet
          </div>
        )}
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center gap-2 truncate">
              <MessageSquare size={16} className="text-secondary" />
              <span className="truncate text-sm">{chat.title}</span>
            </div>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              title="Delete Chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="sidebar-footer">
        {isProfileMenuOpen && (
          <div className="profile-menu">
            <button className="menu-item" onClick={() => {
              onClearAllChats();
              setIsProfileMenuOpen(false);
            }}>
              <Trash2 size={16} />
              <span>Clear conversations</span>
            </button>
            <div className="menu-divider"></div>
            <button className="menu-item" onClick={() => {
              onLogout();
              setIsProfileMenuOpen(false);
            }}>
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
        <button 
          className="profile-btn"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <div className="flex items-center gap-2">
            <div className="profile-avatar">
              <User size={16} />
            </div>
            <span className="text-sm font-medium">User Profile</span>
          </div>
          <MoreHorizontal size={16} className="text-secondary" />
        </button>
      </div>
    </div>
  );
};
