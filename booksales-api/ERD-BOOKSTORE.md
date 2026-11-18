# ERD BookStore

Diagram ini menggambarkan tabel utama yang digunakan aplikasi BookStore.

```mermaid
erDiagram
    USERS ||--o{ CARTS : memiliki
    USERS ||--o{ TRANSACTIONS : membuat
    USERS ||--o{ CONTACTS : mengirim
    AUTHORS ||--o{ BOOKS : menulis
    GENRES ||--o{ BOOKS : mengelompokkan
    BOOKS ||--o{ CARTS : dimasukkan
    BOOKS ||--o{ TRANSACTIONS : dipesan

    USERS {
        bigint id PK
        string name
        string username UK
        string email UK
        string password
        string role
        timestamp created_at
        timestamp updated_at
    }

    AUTHORS {
        bigint id PK
        string name
        text bio
        timestamp created_at
        timestamp updated_at
    }

    GENRES {
        bigint id PK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }

    BOOKS {
        bigint id PK
        string title
        text description
        string cover
        integer price
        integer stock
        bigint author_id FK
        bigint genre_id FK
        timestamp created_at
        timestamp updated_at
    }

    CARTS {
        bigint id PK
        bigint user_id FK
        bigint book_id FK
        integer quantity
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        bigint id PK
        string order_number UK
        bigint user_id FK
        bigint customer_id FK
        bigint book_id FK
        integer quantity
        decimal total_amount
        string status
        string payment_group
        string payment_method
        string payment_status
        string snap_token
        text shipping_address
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    CONTACTS {
        bigint id PK
        bigint user_id FK
        string name
        string email
        string subject
        text message
        boolean is_read
        timestamp created_at
        timestamp updated_at
    }
```

## Penjelasan Relasi

- Satu user dapat memiliki banyak item keranjang.
- Satu user dapat membuat banyak transaksi.
- Satu user dapat mengirim banyak pesan kontak.
- Satu author dapat memiliki banyak buku.
- Satu genre dapat digunakan oleh banyak buku.
- Satu buku dapat muncul di banyak keranjang user.
- Satu buku dapat dipesan dalam banyak transaksi.

## Sumber Struktur Database

Struktur ERD ini dibuat berdasarkan migration Laravel di folder
`database/migrations`.
