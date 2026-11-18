
import { Navigate } from 'react-router';
import { useAuth } from '../Context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  // Jika belum login, arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai, tampilkan akses ditolak
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5">
        <h2>Akses Ditolak</h2>
        <p>
          Kamu tidak memiliki izin untuk membuka halaman ini.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
