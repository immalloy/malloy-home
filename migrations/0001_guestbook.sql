CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  drawing TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS guestbook_entries_status_created_idx
  ON guestbook_entries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS guestbook_entries_ip_created_idx
  ON guestbook_entries (ip_hash, created_at DESC);
