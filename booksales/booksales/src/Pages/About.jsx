function About() {
  const team = [
    {
      name: 'Anwar Muhtari',
      role: 'Fullstack Developer',
      image: '/images/anwar.jpeg',
    },
    {
      name: 'Fadel',
      role: 'Backend Developer',
      image: '/images/fadel.jpg',
    },
    {
      name: 'Ghazy',
      role: 'Frontend Developer',
      image: '/images/ghazy.jpg',
    },
  ];

  return (
    <section className="subpage">
      <span className="hero-label">ABOUT US</span>
      <h1>Tentang Bookstore</h1>
      <p className="subpage-intro">
        Bookstore adalah toko buku online yang menyediakan berbagai koleksi buku
        berkualitas, mulai dari fiksi, non-fiksi, hingga buku pelajaran. Kami
        percaya bahwa setiap buku memiliki cerita yang mampu menginspirasi dan
        membuka wawasan baru bagi pembacanya.
      </p>

      <div className="about-highlight">
        <div>
          <h3>Misi Kami</h3>
          <p>Memudahkan setiap orang menemukan buku yang tepat dengan pengalaman belanja yang sederhana dan nyaman.</p>
        </div>
        <div>
          <h3>Visi Kami</h3>
          <p>Menjadi toko buku online terpercaya yang menumbuhkan budaya literasi di Indonesia.</p>
        </div>
      </div>

      <h2 className="about-team-title">Tim Bookstore</h2>
      <div className="team-grid">
        {team.map((member) => (
          <article className="team-card" key={member.name}>
            <img src={member.image} alt={member.name} className="team-photo" />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default About;
