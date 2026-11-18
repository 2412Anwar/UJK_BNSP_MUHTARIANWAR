import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { apiRequest } from '../Utils/api';
import { bookCover, formatRupiah, statusLabel } from '../Utils/format';

function Orders() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');
  const [payingOrderId, setPayingOrderId] = useState(null);

  const paymentStatus = searchParams.get('transaction_status');
  const paymentInfo = ['settlement', 'capture'].includes(paymentStatus)
    ? 'Pembayaran berhasil. Status pesanan sedang diperbarui.'
    : ['pending', 'authorize'].includes(paymentStatus)
      ? 'Pembayaran masih menunggu konfirmasi dari Midtrans.'
      : '';
  const paymentError = ['deny', 'cancel', 'expire', 'failure'].includes(paymentStatus)
    ? 'Pembayaran belum berhasil. Kamu dapat mencoba membayar kembali.'
    : '';

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest('/my-orders');
      setOrders(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadOrders(), 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  async function payOrder(order) {
    setError('');
    setInfo('');
    setPayingOrderId(order.id);

    try {
      const result = await apiRequest(`/transactions/${order.id}/pay`, {
        method: 'POST',
      });

      if (result.snap?.redirect_url) {
        window.location.assign(result.snap.redirect_url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingOrderId(null);
    }
  }

  if (loading) {
    return <section className="subpage"><p>Memuat pesanan...</p></section>;
  }

  return (
    <section className="subpage orders-page">
      <span className="hero-label">PESANAN</span>
      <h1>Pesanan Saya</h1>
      <p className="subpage-intro">Riwayat dan status pesanan bukumu.</p>

      {(info || paymentInfo) && <p className="form-success"><i className="fa-solid fa-circle-check"></i> {info || paymentInfo}</p>}
      {(error || paymentError) && <p className="form-error"><i className="fa-solid fa-circle-exclamation"></i> {error || paymentError}</p>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada pesanan.</p>
          <Link className="signup-btn" to="/">Belanja Sekarang</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <img src={bookCover(order.book)} alt={order.book?.title} />

              <div className="order-info">
                <span className="order-number">{order.order_number}</span>
                <h3>{order.book?.title || 'Buku'}</h3>
                <p>
                  {order.quantity} x {formatRupiah(order.book?.price || 0)} ={' '}
                  <strong>{formatRupiah(order.total_amount)}</strong>
                </p>
                <p>Metode: {order.payment_method === 'midtrans' ? 'Midtrans' : 'COD'}</p>
                <p>Alamat: {order.shipping_address || '-'}</p>
              </div>

              <div className="order-status">
                <span className={`status-badge status-${order.status}`}>
                  {statusLabel(order.status)}
                </span>
                <span className={`status-badge status-${order.payment_status}`}>
                  {statusLabel(order.payment_status)}
                </span>

                {order.payment_method === 'midtrans' &&
                  order.payment_status !== 'paid' &&
                  order.status !== 'cancelled' && (
                    <button
                      className="signup-btn order-pay-btn"
                      onClick={() => payOrder(order)}
                      disabled={payingOrderId === order.id}
                    >
                      {payingOrderId === order.id ? 'Menyiapkan...' : 'Bayar Sekarang'}
                    </button>
                  )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;
