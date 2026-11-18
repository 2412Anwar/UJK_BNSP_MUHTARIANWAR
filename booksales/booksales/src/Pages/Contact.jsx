import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { apiRequest } from '../Utils/api';

function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await apiRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setMessage(result.message || 'Pesan berhasil dikirim.');
      setForm((current) => ({ ...current, subject: '', message: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="subpage">
      <span className="hero-label">CONTACT</span>
      <h1>Hubungi Admin Bookstore</h1>
      <p className="subpage-intro">
        Punya pertanyaan tentang buku, pesanan, atau ingin bekerja sama? Kirim
        pesanmu kepada admin melalui formulir berikut.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Nama Lengkap</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Subjek</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        />

        <label>Pesan</label>
        <textarea
          name="message"
          rows="5"
          value={form.message}
          onChange={handleChange}
          required
        />

        <button className="signup-btn" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Pesan'}
        </button>

        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
      </form>
    </section>
  );
}

export default Contact;
