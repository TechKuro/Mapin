import React from 'react';
import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSession(data.session);
    navigate('/');
  };

  const signUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setLoading(false);
      setError('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setLoading(false);
      setError('Password must be at least 6 characters.');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // ensure confirm-link returns to the current deployment (works for previews too)
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is enabled, user needs to confirm via email.
    if (data.session) setSession(data.session);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Sign in to Mapin</h1>
        <form className="space-y-3" onSubmit={signIn}>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-3">or</div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => signUp()}
            disabled={loading}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;



