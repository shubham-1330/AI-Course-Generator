import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Brain, LogOut, Edit2, Check, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setEditName(user?.name || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim() || editName === user?.name) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({ name: editName });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <nav className="w-full bg-dark-card/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition-opacity">
            <Brain className="text-primary-500 w-6 h-6" />
            <span className="hidden sm:inline">AI CourseGen</span>
          </Link>
          
          {user && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 bg-dark-bg p-1 rounded-lg border border-primary-500/50">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-transparent text-white text-sm px-2 py-1 focus:outline-none w-32 sm:w-48"
                      autoFocus
                      disabled={isSaving}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button onClick={handleSave} disabled={isSaving} className="p-1 hover:bg-white/10 rounded text-green-400 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={isSaving} className="p-1 hover:bg-white/10 rounded text-dark-muted hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
                    <span className="text-dark-muted hidden md:block group-hover:text-white transition-colors">
                      Welcome, <span className="font-semibold text-white">{user.name}</span>
                    </span>
                    <button className="text-dark-muted md:opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              <button onClick={toggleTheme} className="p-2 text-dark-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button 
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
          
          {!user && (
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 text-dark-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="text-dark-muted hover:text-white transition-colors">Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
