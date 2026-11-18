import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate } from 'react-router';

import About from './Pages/About';
import Admin from './Pages/Admin';
import BookDetail from './Pages/BookDetail';
import Cart from './Pages/Cart';
import Contact from './Pages/Contact';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Orders from './Pages/Orders';
import Profile from './Pages/Profile';
import Register from './Pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { apiRequest } from './Utils/api';

import './App.css';

function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    apiRequest('/genres')
      .then((result) => setGenres(result.data || []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      setLoadingBooks(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (genreId) params.set('genre_id', genreId);

      apiRequest(`/books?${params.toString()}`)
        .then((result) => {
          if (active) setBooks(result.data || []);
        })
        .catch(() => {
          if (active) setBooks([]);
        })
        .finally(() => {
          if (active) setLoadingBooks(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, genreId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setCartCount(0);
        return;
      }

      apiRequest('/cart')
        .then((result) => setCartCount(result.data?.length || 0))
        .catch(() => setCartCount(0));
    }, 0);

    return () => clearTimeout(timer);
  }, [user]);

  const refreshCartCount = useCallback((count) => {
    setCartCount(count);
  }, []);

  async function addToCart(book) {
    if (!user) {
      window.alert('Silakan login terlebih dahulu untuk menambahkan buku ke keranjang.');
      navigate('/login');
      return;
    }

    try {
      const result = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ book_id: book.id, quantity: 1 }),
      });

      window.alert(result.message || `${book.title} ditambahkan ke keranjang.`);
      const cartResult = await apiRequest('/cart');
      setCartCount(cartResult.data?.length || 0);
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleLogout() {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } catch {
      // Token mungkin sudah kedaluwarsa; tetap lanjut logout lokal.
    }

    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="bookstore-navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-logo">
            <span className="brand-icon"><i className="fa-solid fa-book"></i></span> bookstore
          </Link>

          <nav className="navbar-menu">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {user && <NavLink to="/cart">Keranjang{cartCount > 0 ? ` (${cartCount})` : ''}</NavLink>}
            {user && <NavLink to="/orders">Pesanan</NavLink>}
            {user && <NavLink to="/profile">Profile</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}

            {!user ? (
              <span className="navbar-auth-links">
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register" className="register-link">Register</NavLink>
              </span>
            ) : (
              <button type="button" className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                books={books}
                loading={loadingBooks}
                genres={genres}
                search={search}
                setSearch={setSearch}
                genreId={genreId}
                setGenreId={setGenreId}
                addToCart={addToCart}
              />
            }
          />

          <Route path="/book/:id" element={<BookDetail books={books} addToCart={addToCart} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['admin', 'customer']}>
                <Cart refreshCartCount={refreshCartCount} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['admin', 'customer']}>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'customer']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<section className="subpage"><h1>Halaman tidak ditemukan</h1></section>} />
        </Routes>
      </main>

      <footer className="site-footer">
        <strong>bookstore</strong>
        <p>Toko buku online untuk setiap cerita dan inspirasi.</p>
        <small>&copy; 2026 Bookstore. All rights reserved.</small>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
