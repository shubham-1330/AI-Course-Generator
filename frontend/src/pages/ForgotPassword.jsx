import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, ArrowRight } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setResetUrl('');
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setResetUrl(response.data.reset_url || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity">
        <Brain className="text-primary-500 w-6 h-6" /> AI CourseGen
      </Link>

      <div className="glass-card w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Reset Password</h2>
        <p className="text-dark-muted text-center mb-8">Enter your account email to create a secure reset link.</p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-300 p-3 rounded-lg mb-6 text-sm">{message}</div>}
        {resetUrl && (
          <Link to={resetUrl.replace(window.location.origin, '')} className="block bg-primary-500/10 border border-primary-500/40 text-primary-300 p-3 rounded-lg mb-6 text-sm break-words hover:bg-primary-500/20 transition-colors">
            Open reset link
          </Link>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Creating link...' : 'Create Reset Link'} {!isLoading && <Mail className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-dark-muted mt-6 text-sm">
          Remembered it? <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1">Log in <ArrowRight className="w-3 h-3" /></Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
