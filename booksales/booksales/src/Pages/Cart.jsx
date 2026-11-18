import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiRequest } from '../Utils/api';
import { bookCover, formatRupiah } from '../Utils/format';

function Cart({ refreshCartCount }) {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [checkout, setCheckout] = useState({
    phone: '',
    shipping_address: '',
    payment_method: 'cod',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest('/cart');
      setCarts(result.data || []);
      setTotal(result.total || 0);
      refreshCartCount?.(result.data?.length || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshCartCount]);

  useEffect(() => {
    const timer = setTimeout(() => loadCart(), 0);
    return () => clearTimeout(timer);
  }, [loadCart]);

  async function updateQuantity(cart, quantity) {
    if (quantity < 1) return;

    try {
      await apiRequest(`/cart/${cart.id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(cart) {
    if (!window.confirm(`Hapus ${cart.book.title} dari keranjang?`)) return;

    try {
      await apiRequest(`/cart/${cart.id}`, { method: 'DELETE' });
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCheckoutChange(event) {
    const { name, value } = event.target;
    setCheckout((current) => ({ ...current, [name]: value }));
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const result = await apiRequest('/checkout', {
        method: 'POST',
        body: JSON.stringify(checkout),
      });

      refreshCartCount?.(0);

      if (result.snap?.redirect_url) {
        window.location.assign(result.snap.redirect_url);
        return;
      }

      if (checkout.payment_method === 'midtrans') {
        setError(
          result.midtrans_ready
            ? 'Pembayaran Midtrans gagal dibuat. Silakan coba lagi dari halaman Pesanan.'
            : 'Pembayaran Midtrans belum dikonfigurasi di server.'
        );
        navigate('/orders');
        return;
      }

      navigate('/orders', { state: { message: result.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <section className="subpage"><p>Memuat keranjang...</p></section>;
  }

  return (
    <section className="subpage cart-page">
      <span className="hero-label">KERANJANG</span>
      <h1>Keranjang Belanja</h1>
      <p className="subpage-intro">
        Periksa kembali buku pilihanmu sebelum melakukan pembayaran.
      </p>

      {error && <p className="form-error">{error}</p>}
      {info && <p className="form-success">{info}</p>}

      {carts.length === 0 ? (
        <div className="empty-state">
          <p>Keranjangmu masih kosong.</p>
          <Link className="signup-btn" to="/">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {carts.map((cart) => (
              <article className="cart-item" key={cart.id}>
                <img src={bookCover(cart.book)} alt={cart.book.title} />

                <div className="cart-item-info">
                  <h3>{cart.book.title}</h3>
                  <p>{cart.book.author?.name}</p>
                  <strong>{formatRupiah(cart.book.price)}</strong>
                </div>

                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(cart, cart.quantity - 1)}
                      disabled={cart.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{cart.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(cart, cart.quantity + 1)}
                      disabled={cart.quantity >= cart.book.stock}
                    >
                      +
                    </button>
                  </div>

                  <strong>{formatRupiah(cart.book.price * cart.quantity)}</strong>

                  <button className="danger-link" onClick={() => removeItem(cart)}>
                    Hapus
                  </button>
                </div>
              </article>
            ))}

            <div className="cart-total">
              <span>Total</span>
              <strong>{formatRupiah(total)}</strong>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleCheckout}>
            <div className="checkout-heading">
              <span className="checkout-step">01</span>
              <div>
                <h2>Data Pengiriman</h2>
                <p>Masukkan alamat untuk pengiriman buku.</p>
              </div>
            </div>

            <label>Nomor Telepon</label>
            <input
              type="text"
              name="phone"
              value={checkout.phone}
              onChange={handleCheckoutChange}
              placeholder="08xxxxxxxxxx"
              required
            />

            <label>Alamat Pengiriman</label>
            <textarea
              name="shipping_address"
              rows="4"
              value={checkout.shipping_address}
              onChange={handleCheckoutChange}
              placeholder="Tulis alamat lengkap pengiriman"
              required
            />

            <div className="checkout-heading payment-heading">
              <span className="checkout-step">02</span>
              <div>
                <h2>Metode Pembayaran</h2>
                <p>Pilih metode pembayaran yang kamu inginkan.</p>
              </div>
            </div>

            <div className="payment-options">
            <label className={`payment-option ${checkout.payment_method === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={checkout.payment_method === 'cod'}
                onChange={handleCheckoutChange}
              />
              <span className="payment-option-copy">
                <strong>Bayar di Tempat</strong>
                <small>Bayar saat buku diterima</small>
              </span>
            </label>

            <label className={`payment-option ${checkout.payment_method === 'midtrans' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment_method"
                value="midtrans"
                checked={checkout.payment_method === 'midtrans'}
                onChange={handleCheckoutChange}
              />
              <span className="payment-option-copy">
                <strong>Midtrans</strong>
                <small>Kartu, QRIS, atau Virtual Account</small>
              </span>
            </label>
            </div>

            <div className="checkout-summary">
              <span>Total Pembayaran</span>
              <strong>{formatRupiah(total)}</strong>
            </div>

            <button className="signup-btn checkout-btn" disabled={submitting}>
              {submitting ? 'Menyiapkan pembayaran...' : 'Lanjutkan Pembayaran'}
            </button>
            <small className="secure-payment-note">
              <i className="fa-solid fa-lock"></i> Data pembayaran diproses dengan aman.
            </small>
          </form>
        </div>
      )}
    </section>
  );
}

export default Cart;
