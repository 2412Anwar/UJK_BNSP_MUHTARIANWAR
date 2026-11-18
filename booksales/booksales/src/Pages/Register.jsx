
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiRequest } from '../Utils/api';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (formData.username.trim().length < 4) {
      setMessage('Username minimal 4 karakter.');
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setMessage(result.message || 'Registrasi berhasil.');

      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
      });

      setTimeout(() => navigate('/login'), 1000);
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
        style={{ maxWidth: '500px' }}
      >
        <h2 className="text-center mb-2">
          Registrasi Pengguna
        </h2>

        <p className="text-center text-muted mb-4">
          Silakan isi data untuk membuat akun.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              minLength={4}
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        {message && (
          <div className="alert alert-info mt-3 mb-0">
            {message}
          </div>
        )}

        <p className="text-center mt-3 mb-0">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
