export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function bookCover(book) {
  return (
    book?.cover ||
    `https://placehold.co/400x520/eef4ff/2563eb?text=${encodeURIComponent(
      book?.title || 'Buku'
    )}`
  );
}

export function statusLabel(status) {
  const labels = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    processing: 'Diproses',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    unpaid: 'Belum Dibayar',
    failed: 'Gagal',
  };

  return labels[status] || status;
}
