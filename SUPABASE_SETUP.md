# Guida Configurazione Supabase per Magazzino FG

## 1. Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un account (se non ce l'hai)
3. Crea un nuovo progetto
4. Annota l'URL del progetto e la chiave API (anon/public)

## 2. Configura il Database

1. Nel dashboard di Supabase, vai su **SQL Editor**
2. Crea una nuova query
3. Copia e incolla il contenuto di `supabase-schema.sql`
4. Esegui la query per creare tutte le tabelle

## 3. Configura le Variabili d'Ambiente

### Per sviluppo locale:

1. Copia `.env.example` in `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Modifica `.env.local` con i tuoi valori:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...tua_chiave_qui
   VITE_USE_OFFLINE_MODE=false
   ```

3. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```

### Per Vercel:

1. Vai sul dashboard di Vercel
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi queste variabili:
   - `VITE_SUPABASE_URL` = il tuo URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = la tua chiave anon Supabase
   - `VITE_USE_OFFLINE_MODE` = `false`

## 4. Installa le Dipendenze

```bash
npm install
```

Questo installerà `@supabase/supabase-js` automaticamente.

## 5. Deploy su Vercel

```bash
npm run build
```

Poi:
1. Connetti il repository a Vercel
2. Configura le variabili d'ambiente (punto 3)
3. Deploy!

## 6. Modalità Offline (Opzionale)

Se vuoi continuare a usare localStorage invece di Supabase, imposta:
```
VITE_USE_OFFLINE_MODE=true
```

oppure semplicemente non configurare le variabili SUPABASE_URL e SUPABASE_ANON_KEY.

## Note Importanti

- **Real-time sync**: Le modifiche si sincronizzano automaticamente tra tutti i dispositivi
- **Row Level Security**: Attualmente configurato per accesso pubblico. Per produzione, considera di aggiungere autenticazione
- **Backup**: Export/Import continuerà a funzionare anche con Supabase come funzione di backup
- **Migrazione dati**: Se hai dati in localStorage, usa "Esporta" prima di passare a Supabase, poi "Importa" dopo la configurazione

## Risoluzione Problemi

### L'app non si connette a Supabase
- Verifica che le variabili d'ambiente siano corrette
- Controlla la console del browser per errori
- Assicurati che il progetto Supabase sia attivo

### I dati non si sincronizzano
- Verifica che le tabelle siano state create correttamente
- Controlla le RLS policies nel dashboard Supabase

### Voglio tornare a localStorage
- Imposta `VITE_USE_OFFLINE_MODE=true` nelle variabili d'ambiente
- Oppure rimuovi le chiavi Supabase dalle variabili d'ambiente
