import { Link } from 'react-router-dom';
import { BookOpen, Brain, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center transition-colors duration-300">
      {/* Navbar Stub */}
      <nav className="w-full max-w-6xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          <Brain className="text-primary-500 w-8 h-8" />
          <span>AI CourseGen</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-dark-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mt-20">

        <h1 className="text-5xl md:text-7xl font-extrabold text-white bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500 mb-6 leading-tight">
          Learn Anything. <br /> Master Everything.
        </h1>
        <p className="text-xl text-dark-muted mb-10 max-w-2xl leading-relaxed">
          Generate comprehensive, personalized course curriculums with detailed lessons and quizzes in seconds. Your AI tutor awaits.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/signup" className="btn-primary text-lg py-3 px-8 flex items-center justify-center gap-2">
            Start Generating <Zap className="w-5 h-5" />
          </Link>
          <a href="#features" className="btn-secondary text-lg py-3 px-8">
            See how it works
          </a>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="w-full max-w-6xl px-6 py-24 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6 text-primary-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Structured Learning</h3>
          <p className="text-dark-muted">Instant, logical curriculums divided into manageable modules and lessons.</p>
        </div>

        <div className="glass-card p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">AI-Generated Lessons</h3>
          <p className="text-dark-muted">Deep, comprehensive markdown content with code snippets and analogies.</p>
        </div>

        <div className="glass-card p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Interactive Quizzes</h3>
          <p className="text-dark-muted">Test your knowledge immediately after each lesson to reinforce learning.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-dark-muted border-t border-white/10 mt-auto">
        <p>© 2026 AI Course Generator. Built for the future.</p>
      </footer>
    </div>
  );
};

export default Home;
