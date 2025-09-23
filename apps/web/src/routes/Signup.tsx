import React from 'react';
import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useAuthStore } from '../store/auth';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!fullName || !email || !country || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullName, country, phone },
        emailRedirectTo: window.location.origin + '/login',
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setMessage('Check your email to confirm your account.');
      return;
    }

    setSession(data.session);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Create your Mapin account</h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Country</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 20 7946 0958"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="text-xs text-gray-600 mt-3 text-center">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline" to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;


