CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    src TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    description TEXT,
    source TEXT NOT NULL,
    instagramUrl TEXT,
    section TEXT DEFAULT 'gallery',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
