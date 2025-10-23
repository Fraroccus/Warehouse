-- Tabella per gli scaffali
CREATE TABLE shelves (
  id TEXT PRIMARY KEY,
  position JSONB NOT NULL,
  size JSONB NOT NULL,
  color TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per gli articoli
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  shelf_id TEXT NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per le note
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per migliorare le performance
CREATE INDEX idx_items_shelf_id ON items(shelf_id);
CREATE INDEX idx_notes_is_read ON notes(is_read);

-- Trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shelves_updated_at BEFORE UPDATE ON shelves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Abilita Row Level Security (RLS)
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di leggere e scrivere (modifica secondo le tue esigenze)
-- Per ora permette accesso pubblico, in futuro puoi aggiungere autenticazione
CREATE POLICY "Enable all access for shelves" ON shelves FOR ALL USING (true);
CREATE POLICY "Enable all access for items" ON items FOR ALL USING (true);
CREATE POLICY "Enable all access for notes" ON notes FOR ALL USING (true);
