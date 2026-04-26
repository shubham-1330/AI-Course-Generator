import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';

const CreateCourse = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a course topic');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      const response = await api.post(`/courses/generate?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}`);
      if (response.data && response.data.course_id) {
        navigate(`/course/${response.data.course_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate course. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center mt-20 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
              <Brain className="w-24 h-24 text-primary-400 relative z-10 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-white mt-8 mb-2 text-center">AI is Architecting Your Course</h2>
            <p className="text-dark-muted text-center max-w-md">
              Our models are synthesizing vast amounts of data to create a structured, comprehensive curriculum on <span className="text-white font-semibold">{topic}</span>. This may take 10-20 seconds.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-4">Generate a Course</h1>
              <p className="text-dark-muted text-lg">Tell the AI what you want to learn, and it will build a complete curriculum for you.</p>
            </div>
            
            <div className="glass-card p-8 shadow-2xl">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">What do you want to learn?</label>
                  <textarea 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="input-field min-h-[100px] resize-none text-lg"
                    placeholder="e.g. Advanced React Patterns with Server Components, or Quantum Physics Basics..."
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-lg border transition-all duration-200 ${
                          difficulty === level 
                            ? 'bg-primary-500/20 border-primary-500 text-primary-400 font-semibold' 
                            : 'bg-dark-bg border-white/10 text-dark-muted hover:border-white/30'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group"
                  >
                    Generate Curriculum <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateCourse;
