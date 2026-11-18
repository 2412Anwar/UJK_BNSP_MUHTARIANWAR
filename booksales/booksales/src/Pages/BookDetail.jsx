import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiRequest } from '../Utils/api';
import { bookCover, formatRupiah } from '../Utils/format';

function BookDetail({ books, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(
    () => books.find((item) => String(item.id) === String(id)) || null
  );
  const [loading, setLoading] = useState(!book);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book && String(book.id) === String(id)) {
      return;
    }

    let active = true;
    const loadingTimer = setTimeout(() => setLoading(true), 0);

    apiRequest(`/books/${id}`)
      .then((result) => {
        if (active) setBook(result.data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(loadingTimer);
    };
  }, [id, book]);

  if (loading) {
    return <section className="subpage"><p>Memuat detail buku...</p></section>;
  }

  if (error || !book) {
    return (
      <section className="subpage">
        <h1>Buku tidak ditemukan</h1>
        <p className="subpage-intro">{error || 'Buku yang kamu cari tidak tersedia.'}</p>
        <button className="detail-btn" onClick={() => navigate('/')}>Kembali ke Home</button>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <button className="back-button" onClick={() => navigate('/')}>
        <i className="fa-solid fa-arrow-left"></i> Kembali ke Home
      </button>

      <div className="detail-layout">
        <img src={bookCover(book)} alt={book.title} />

        <div>
          <span className="hero-label">{book.genre?.name || 'Umum'}</span>
          <h1>{book.title}</h1>
          <p className="detail-author">Ditulis oleh {book.author?.name || 'Penulis'}</p>
          <p>{book.description || 'Belum ada deskripsi untuk buku ini.'}</p>
          <p className="detail-stock">Stok tersedia: {book.stock}</p>
          <h2 className="detail-price">{formatRupiah(book.price)}</h2>
          <button
            className="signup-btn"
            onClick={() => addToCart(book)}
            disabled={book.stock < 1}
          >
            {book.stock < 1 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookDetail;
