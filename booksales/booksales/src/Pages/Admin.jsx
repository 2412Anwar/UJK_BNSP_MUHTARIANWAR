import { useEffect, useState } from 'react';
import { apiRequest } from '../Utils/api';
import { bookCover, formatRupiah, statusLabel } from '../Utils/format';

const emptyBook = {
  title: '',
  description: '',
  cover: '',
  price: '',
  stock: '',
  author_id: '',
  genre_id: '',
};

function Admin() {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [bookForm, setBookForm] = useState(emptyBook);
  const [editingBook, setEditingBook] = useState(null);
  const [genreForm, setGenreForm] = useState({ name: '', description: '' });
  const [editingGenre, setEditingGenre] = useState(null);
  const [authorForm, setAuthorForm] = useState({ name: '', bio: '' });
  const [editingAuthor, setEditingAuthor] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);

    try {
      const [bookResult, genreResult, authorResult, userResult, orderResult, contactResult] =
        await Promise.all([
          apiRequest('/books'),
          apiRequest('/genres'),
          apiRequest('/authors'),
          apiRequest('/users'),
          apiRequest('/transactions'),
          apiRequest('/contacts'),
        ]);

      setBooks(bookResult.data || []);
      setGenres(genreResult.data || []);
      setAuthors(authorResult.data || []);
      setUsers(userResult.data || []);
      setOrders(orderResult.data || []);
      setMessages(contactResult.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function notify(text) {
    setError('');
    setNotice(text);
  }

  function fail(err) {
    setNotice('');
    setError(err.message);
  }

  // ================= BOOKS =================
  function handleBookChange(event) {
    const { name, value } = event.target;
    setBookForm((current) => ({ ...current, [name]: value }));
  }

  function startEditBook(book) {
    setEditingBook(book.id);
    setBookForm({
      title: book.title || '',
      description: book.description || '',
      cover: book.cover || '',
      price: book.price || '',
      stock: book.stock ?? '',
      author_id: book.author_id || '',
      genre_id: book.genre_id || '',
    });
  }

  function resetBookForm() {
    setEditingBook(null);
    setBookForm(emptyBook);
  }

  async function submitBook(event) {
    event.preventDefault();

    try {
      const endpoint = editingBook ? `/books/${editingBook}` : '/books';
      const method = editingBook ? 'PUT' : 'POST';

      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(bookForm),
      });

      notify(editingBook ? 'Buku berhasil diperbarui.' : 'Buku berhasil ditambahkan.');
      resetBookForm();
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Hapus buku ${book.title}?`)) return;

    try {
      await apiRequest(`/books/${book.id}`, { method: 'DELETE' });
      notify('Buku berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  // ================= GENRES =================
  async function submitGenre(event) {
    event.preventDefault();

    try {
      const endpoint = editingGenre ? `/genres/${editingGenre}` : '/genres';
      await apiRequest(endpoint, {
        method: editingGenre ? 'PUT' : 'POST',
        body: JSON.stringify(genreForm),
      });

      notify(editingGenre ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.');
      setGenreForm({ name: '', description: '' });
      setEditingGenre(null);
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  function startEditGenre(genre) {
    setEditingGenre(genre.id);
    setGenreForm({ name: genre.name, description: genre.description || '' });
  }

  async function deleteGenre(genre) {
    if (!window.confirm(`Hapus kategori ${genre.name}?`)) return;

    try {
      await apiRequest(`/genres/${genre.id}`, { method: 'DELETE' });
      notify('Kategori berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  // ================= AUTHORS =================
  async function submitAuthor(event) {
    event.preventDefault();

    try {
      const endpoint = editingAuthor ? `/authors/${editingAuthor}` : '/authors';
      await apiRequest(endpoint, {
        method: editingAuthor ? 'PUT' : 'POST',
        body: JSON.stringify(authorForm),
      });

      notify(editingAuthor ? 'Author berhasil diperbarui.' : 'Author berhasil ditambahkan.');
      setAuthorForm({ name: '', bio: '' });
      setEditingAuthor(null);
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  function startEditAuthor(author) {
    setEditingAuthor(author.id);
    setAuthorForm({ name: author.name, bio: author.bio || '' });
  }

  async function deleteAuthor(author) {
    if (!window.confirm(`Hapus author ${author.name}?`)) return;

    try {
      await apiRequest(`/authors/${author.id}`, { method: 'DELETE' });
      notify('Author berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  // ================= USERS =================
  async function deleteUser(user) {
    if (!window.confirm(`Hapus user ${user.name}?`)) return;

    try {
      await apiRequest(`/users/${user.id}`, { method: 'DELETE' });
      notify('User berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  // ================= ORDERS =================
  async function updateOrder(order, data) {
    try {
      await apiRequest(`/transactions/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      notify('Pesanan berhasil diperbarui.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  async function deleteOrder(order) {
    if (!window.confirm(`Hapus pesanan ${order.order_number}?`)) return;

    try {
      await apiRequest(`/transactions/${order.id}`, { method: 'DELETE' });
      notify('Pesanan berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  // ================= MESSAGES =================
  async function markMessage(message) {
    try {
      await apiRequest(`/contacts/${message.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_read: !message.is_read }),
      });
      notify('Status pesan diperbarui.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  async function deleteMessage(message) {
    if (!window.confirm('Hapus pesan ini?')) return;

    try {
      await apiRequest(`/contacts/${message.id}`, { method: 'DELETE' });
      notify('Pesan berhasil dihapus.');
      await loadAll();
    } catch (err) {
      fail(err);
    }
  }

  const tabs = [
    { key: 'books', label: 'Data Buku', icon: 'fa-book' },
    { key: 'genres', label: 'Kategori Buku', icon: 'fa-tags' },
    { key: 'authors', label: 'Author', icon: 'fa-pen-nib' },
    { key: 'users', label: 'User Terdaftar', icon: 'fa-users' },
    { key: 'orders', label: 'Pesanan', icon: 'fa-receipt' },
    { key: 'messages', label: 'Pesan Kontak', icon: 'fa-envelope' },
  ];

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <span className="hero-label">ADMIN PANEL</span>
          <h1>Dashboard Bookstore</h1>
          <p>Kelola buku, kategori, user, pesanan, dan pesan dari user.</p>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            className={tab === item.key ? 'active' : ''}
            onClick={() => setTab(item.key)}
          >
            <i className={`fa-solid ${item.icon}`}></i> {item.label}
          </button>
        ))}
      </div>

      {notice && <div className="alert-box success">{notice}</div>}
      {error && <div className="alert-box error">{error}</div>}

      {loading ? (
        <p className="empty-state">Memuat data...</p>
      ) : (
        <>
          {tab === 'books' && (
            <div className="admin-grid">
              <form className="admin-form" onSubmit={submitBook}>
                <h2>{editingBook ? 'Edit Buku' : 'Tambah Buku'}</h2>

                <label>Judul Buku</label>
                <input name="title" value={bookForm.title} onChange={handleBookChange} required />

                <label>Author</label>
                <select name="author_id" value={bookForm.author_id} onChange={handleBookChange} required>
                  <option value="">Pilih author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>

                <label>Kategori</label>
                <select name="genre_id" value={bookForm.genre_id} onChange={handleBookChange}>
                  <option value="">Tanpa kategori</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>

                <div className="form-row">
                  <div>
                    <label>Harga</label>
                    <input type="number" name="price" min="0" value={bookForm.price} onChange={handleBookChange} required />
                  </div>
                  <div>
                    <label>Stok</label>
                    <input type="number" name="stock" min="0" value={bookForm.stock} onChange={handleBookChange} required />
                  </div>
                </div>

                <label>URL Cover (opsional)</label>
                <input name="cover" value={bookForm.cover} onChange={handleBookChange} placeholder="https://..." />

                <label>Deskripsi</label>
                <textarea name="description" rows="3" value={bookForm.description} onChange={handleBookChange} />

                <div className="form-actions">
                  <button className="signup-btn">{editingBook ? 'Simpan Perubahan' : 'Tambah Buku'}</button>
                  {editingBook && (
                    <button type="button" className="detail-btn" onClick={resetBookForm}>Batal</button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h2>Daftar Buku ({books.length})</h2>
                {books.map((book) => (
                  <article className="admin-item" key={book.id}>
                    <img src={bookCover(book)} alt={book.title} />
                    <div className="admin-item-body">
                      <strong>{book.title}</strong>
                      <p>{book.author?.name} · {book.genre?.name || 'Umum'}</p>
                      <p>{formatRupiah(book.price)} · Stok {book.stock}</p>
                      <div className="admin-item-actions">
                        <button className="btn-edit" onClick={() => startEditBook(book)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteBook(book)}>Hapus</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'genres' && (
            <div className="admin-grid">
              <form className="admin-form" onSubmit={submitGenre}>
                <h2>{editingGenre ? 'Edit Kategori' : 'Tambah Kategori'}</h2>

                <label>Nama Kategori</label>
                <input
                  value={genreForm.name}
                  onChange={(event) => setGenreForm({ ...genreForm, name: event.target.value })}
                  required
                />

                <label>Deskripsi</label>
                <textarea
                  rows="4"
                  value={genreForm.description}
                  onChange={(event) => setGenreForm({ ...genreForm, description: event.target.value })}
                  required
                />

                <div className="form-actions">
                  <button className="signup-btn">{editingGenre ? 'Simpan' : 'Tambah'}</button>
                  {editingGenre && (
                    <button
                      type="button"
                      className="detail-btn"
                      onClick={() => {
                        setEditingGenre(null);
                        setGenreForm({ name: '', description: '' });
                      }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h2>Daftar Kategori ({genres.length})</h2>
                {genres.map((genre) => (
                  <article className="admin-item text-only" key={genre.id}>
                    <div className="admin-item-body">
                      <strong>{genre.name}</strong>
                      <p>{genre.description}</p>
                      <div className="admin-item-actions">
                        <button className="btn-edit" onClick={() => startEditGenre(genre)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteGenre(genre)}>Hapus</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'authors' && (
            <div className="admin-grid">
              <form className="admin-form" onSubmit={submitAuthor}>
                <h2>{editingAuthor ? 'Edit Author' : 'Tambah Author'}</h2>

                <label>Nama Author</label>
                <input
                  value={authorForm.name}
                  onChange={(event) => setAuthorForm({ ...authorForm, name: event.target.value })}
                  required
                />

                <label>Biografi</label>
                <textarea
                  rows="4"
                  value={authorForm.bio}
                  onChange={(event) => setAuthorForm({ ...authorForm, bio: event.target.value })}
                  required
                />

                <div className="form-actions">
                  <button className="signup-btn">{editingAuthor ? 'Simpan' : 'Tambah'}</button>
                  {editingAuthor && (
                    <button
                      type="button"
                      className="detail-btn"
                      onClick={() => {
                        setEditingAuthor(null);
                        setAuthorForm({ name: '', bio: '' });
                      }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <div className="admin-list">
                <h2>Daftar Author ({authors.length})</h2>
                {authors.map((author) => (
                  <article className="admin-item text-only" key={author.id}>
                    <div className="admin-item-body">
                      <strong>{author.name}</strong>
                      <p>{author.bio}</p>
                      <div className="admin-item-actions">
                        <button className="btn-edit" onClick={() => startEditAuthor(author)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteAuthor(author)}>Hapus</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="admin-table-wrap">
              <h2>User Terdaftar ({users.length})</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.username || '-'}</td>
                      <td>{user.email}</td>
                      <td><span className="status-badge status-paid">{user.role}</span></td>
                      <td>
                        {user.role !== 'admin' && (
                          <button className="btn-delete" onClick={() => deleteUser(user)}>Hapus</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'orders' && (
            <div className="admin-table-wrap">
              <h2>Daftar Pesanan ({orders.length})</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Pesanan</th>
                    <th>User</th>
                    <th>Buku</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.user?.name || '-'}</td>
                      <td>{order.book?.title || '-'}</td>
                      <td>{order.quantity}</td>
                      <td>{formatRupiah(order.total_amount)}</td>
                      <td>{order.payment_method}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(event) => updateOrder(order, { status: event.target.value })}
                        >
                          {['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
                            <option key={status} value={status}>{statusLabel(status)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn-delete" onClick={() => deleteOrder(order)}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'messages' && (
            <div className="admin-list">
              <h2>Pesan Kontak ({messages.length})</h2>
              {messages.length === 0 && <p className="empty-state">Belum ada pesan.</p>}
              {messages.map((message) => (
                <article className={`message-card ${message.is_read ? 'read' : ''}`} key={message.id}>
                  <div className="message-head">
                    <div>
                      <strong>{message.subject}</strong>
                      <p>{message.name} · {message.email}</p>
                    </div>
                    <span className="status-badge status-pending">
                      {message.is_read ? 'Sudah dibaca' : 'Baru'}
                    </span>
                  </div>
                  <p className="message-body">{message.message}</p>
                  <div className="admin-item-actions">
                    <button className="btn-edit" onClick={() => markMessage(message)}>
                      {message.is_read ? 'Tandai Baru' : 'Tandai Dibaca'}
                    </button>
                    <button className="btn-delete" onClick={() => deleteMessage(message)}>Hapus</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Admin;
