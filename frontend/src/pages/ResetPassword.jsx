import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, KeyRound } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('This reset link is missing a token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not reset password');
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
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Choose New Password</h2>
        <p className="text-dark-muted text-center mb-8">Use at least 6 characters.</p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-300 p-3 rounded-lg mb-6 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-muted mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Saving password...' : 'Reset Password'} {!isLoading && <KeyRound className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-dark-muted mt-6 text-sm">
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
