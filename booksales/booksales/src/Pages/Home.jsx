import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { bookCover, formatRupiah } from '../Utils/format';

function Home({ books, loading, genres, search, setSearch, genreId, setGenreId, addToCart }) {
  const navigate = useNavigate();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const safeIndex = books.length
    ? ((featuredIndex % books.length) + books.length) % books.length
    : 0;
  const featured = books[safeIndex] || books[0];

  const genreOptions = useMemo(() => genres || [], [genres]);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(search.trim());
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">TEMUKAN BUKU FAVORITMU</span>
          <h1>{featured ? featured.title : 'Bookstore, Tempat Cerita Baru Dimulai'}</h1>
          <p>
            {featured
              ? featured.description || 'Buku pilihan terbaik untuk menemani harimu.'
              : 'Jelajahi koleksi buku terbaik kami dan temukan cerita yang menginspirasi.'}
          </p>

          {featured && (
            <>
              <p className="hero-price">
                {formatRupiah(featured.price)} · Stok {featured.stock}
              </p>

              <div className="hero-buttons">
                <button
                  className="signup-btn hero-buy"
                  onClick={() => addToCart(featured)}
                  disabled={featured.stock < 1}
                >
                  {featured.stock < 1 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </button>

                <button
                  className="detail-btn"
                  onClick={() => navigate(`/book/${featured.id}`)}
                >
                  Detail Buku
                </button>
              </div>

              {books.length > 1 && (
                <div className="hero-pagination">
                  <button
                    className="detail-btn"
                    onClick={() => setFeaturedIndex(safeIndex - 1)}
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <span>
                    {safeIndex + 1} / {books.length}
                  </span>
                  <button
                    className="detail-btn"
                    onClick={() => setFeaturedIndex(safeIndex + 1)}
                  >
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="hero-image-wrap">
          <img
            src={featured ? bookCover(featured) : 'https://placehold.co/720x600?text=Bookstore'}
            alt={featured?.title || 'Bookstore'}
            className="hero-image"
          />
          {featured && (
            <div className="image-caption">
              <span>Buku Pilihan</span>
              <strong>{featured.title}</strong>
              <small>{featured.author?.name || 'Penulis'}</small>
            </div>
          )}
        </div>
      </section>

      <section className="book-section" id="koleksi">
        <div className="section-heading">
          <div>
            <span className="hero-label">KOLEKSI KAMI</span>
            <h2>Buku untuk Setiap Cerita</h2>
            <p>Cari buku berdasarkan judul, penulis, atau kategori.</p>
          </div>
        </div>

        <form className="catalog-toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Cari judul buku, penulis, atau kategori..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={genreId}
            onChange={(event) => setGenreId(event.target.value)}
          >
            <option value="">Semua Kategori</option>
            {genreOptions.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <button type="submit" className="signup-btn">
            <i className="fa-solid fa-magnifying-glass"></i> Cari
          </button>
        </form>

        {loading ? (
          <p className="empty-state">Memuat koleksi buku...</p>
        ) : books.length === 0 ? (
          <p className="empty-state">Tidak ada buku yang cocok dengan pencarianmu.</p>
        ) : (
          <div className="book-grid">
            {books.map((item) => (
              <article className="book-card" key={item.id}>
                <img src={bookCover(item)} alt={item.title} />
                <div className="book-card-body">
                  <span className="book-category">
                    {item.genre?.name || 'Umum'}
                  </span>
                  <h3>{item.title}</h3>
                  <p>Oleh {item.author?.name || 'Penulis'}</p>
                  <p className="book-card-description">{item.description}</p>
                  <div className="book-card-bottom">
                    <strong>{formatRupiah(item.price)}</strong>
                    <button onClick={() => navigate(`/book/${item.id}`)}>
                      Lihat Detail
                    </button>
                  </div>
                  <div className="book-card-actions">
                    <button
                      className="signup-btn"
                      onClick={() => addToCart(item)}
                      disabled={item.stock < 1}
                    >
                      {item.stock < 1 ? 'Stok Habis' : '+ Keranjang'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
