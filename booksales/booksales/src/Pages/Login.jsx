
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiRequest } from '../Utils/api';
import { useAuth } from '../Context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const result = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!result.success || !result.user || !result.token) {
        throw new Error(result.message || 'Login gagal.');
      }

      login(result.user, result.token);

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-5">
      <div
        className="card shadow-sm border-0 p-4 mx-auto"
        style={{ maxWidth: '450px' }}
      >
        <h2 className="text-center mb-3">Login BookSales</h2>
        <p className="text-center text-muted">
          Silakan masuk menggunakan akun kamu.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {message && (
          <div className="alert alert-danger mt-3 mb-0">
            {message}
          </div>
        )}

        <p className="text-center mt-3 mb-0">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
