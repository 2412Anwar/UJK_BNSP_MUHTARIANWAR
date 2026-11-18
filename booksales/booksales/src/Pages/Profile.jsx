
import { useAuth } from '../Context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <section className="container py-5">
      <div
        className="card shadow-sm border-0 p-4 mx-auto"
        style={{ maxWidth: '550px' }}
      >
        <h2 className="mb-3">Profil Pengguna</h2>
        <p className="text-muted">
          Berikut informasi akun kamu.
        </p>

        <hr />

        <p>
          <strong>Nama Lengkap:</strong> {user?.name || '-'}
        </p>

        <p>
          <strong>Username:</strong> {user?.username || '-'}
        </p>

        <p>
          <strong>Email:</strong> {user?.email || '-'}
        </p>

        <p>
          <strong>Role:</strong> {user?.role || '-'}
        </p>
      </div>
    </section>
  );
}

export default Profile;
