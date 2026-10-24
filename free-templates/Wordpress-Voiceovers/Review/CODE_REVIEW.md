# Code Review — GoogleCloud-Code (v1.1)

**File recensiti:** `main.py`, `Dockerfile.txt`, `requirements.txt`
**Verdetto:** il servizio funziona ed è semplice (pregio), ma ha **2 problemi bloccanti per la qualità di un prodotto a pagamento** (errori HTTP 200 e configurazione hardcoded) e diversi punti migliorabili. Le versioni corrette sono in [`Review/fixed/`](fixed/).

---

## Sintesi dei problemi

| # | Severità | Problema | File |
|---|----------|----------|------|
| 1 | 🔴 Alta | Gli errori restituiscono **HTTP 200** → n8n non si accorge del fallimento | `main.py:57-60` |
| 2 | 🔴 Alta | `BUCKET_NAME`/`PROJECT_ID` hardcoded; la guida parla di un file `.env` che il codice **non legge** e che **non è nel pack** | `main.py:10-11` |
| 3 | 🟡 Media | Regione hardcoded `europe-west12` (la guida dice `europe-west1`); le docs Google usano il **project number**, non il project ID, nel `parent` | `main.py:42` |
| 4 | 🟡 Media | Nessuna autenticazione sull'endpoint + deploy con `--allow-unauthenticated`: chiunque trovi l'URL genera audio a spese del proprietario | `main.py` |
| 5 | 🟡 Media | `async def` con chiamata gRPC **bloccante** → blocca l'event loop di uvicorn | `main.py:22-24` |
| 6 | 🟡 Media | Nessuna validazione dell'input: testo vuoto, testo > 1 MB (limite API), `filename` non sanitized | `main.py` |
| 7 | 🟢 Bassa | `requirements.txt` senza versioni pinnate → build non riproducibili | `requirements.txt` |
| 8 | 🟢 Bassa | Dockerfile senza utente non-root, `EXPOSE`, `PYTHONDONTWRITEBYTECODE`; porta fissa (Cloud Run usa la variabile `PORT`) | `Dockerfile.txt` |
| 9 | 🟢 Bassa | Dettagli dell'errore interni restituiti al chiamante (`str(e)` può leakare path/config) | `main.py:60` |
| 10 | 🟢 Bassa | Default `voice = "it-IT-Wavenet-B"` mai usato dal workflow (che passa sempre la voce esplicita) | `main.py:17` |

---

## Dettaglio

### 1. 🔴 Errori con HTTP 200 (`main.py:57-60`)

```python
except Exception as e:
    print("❌ ERROR:", str(e))
    traceback.print_exc()
    return {"error": str(e)}   # ← FastAPI risponde 200 OK
```

Conseguenza concreta sul workflow: il nodo **HTTP GCP TTS** riceve 200, prosegue regolarmente, la pagina WordPress viene aggiornata con un player che punta a un file inesistente e la riga viene marcata `Status=done`. Il fallimento è **silenzioso e permanente** (la riga non verrà più ritentata).

**Fix:** sollevare `HTTPException` con lo status code corretto (400/413/500/502). Così il nodo HTTP fallisce, l'esecuzione si interrompe, la riga resta senza `Status` e verrà ritentata al run successivo.

### 2. 🔴 Configurazione hardcoded + `.env` fantasma (`main.py:10-11`)

```python
BUCKET_NAME = "your-bucket-name"
PROJECT_ID = "your-gcp-project-id"
```

Il `DEPLOYMENT_GUIDE.md` della v1 (sezione *Environment Variables*) istruisce l'utente a creare un `.env` con `PROJECT_ID`, `BUCKET_NAME`, `REGION` e cita un `.env.example` tra i file del progetto. **Il codice non legge alcuna variabile d'ambiente** e `.env.example` non esiste nel pack. Chi segue la guida ottiene un servizio che scrive nel bucket `your-bucket-name`.

**Fix:** leggere da env con `os.environ[...]` (fail-fast se mancante), spedire un vero `.env.example` e in Cloud Run usare `--set-env-vars`. Nota: un container su Cloud Run non legge comunque i file `.env` locali — la via corretta sono le env vars della piattaforma.

### 3. 🟡 Regione e `parent` (`main.py:42`)

- `locations/europe-west12` è hardcoded mentre la guida deploy dice `europe-west1`: incoerenza da normalizzare (regione configurabile via env; europe-west12/Milano è corretta se il bucket è lì).
- La documentazione ufficiale di `synthesizeLongAudio` specifica il `parent` come `projects/{PROJECT_NUMBER}/locations/{LOCATION}`. Il project ID di solito funziona, ma se un buyer riceve un errore 403/404 sul parent, il project number è la prima cosa da provare → va documentato (nelle nuove docs è fatto).

### 4. 🟡 Endpoint senza autenticazione

Deploy consigliato dalla guida: `--allow-unauthenticated`. L'URL di Cloud Run è pubblico: chi lo scopre (log, riferimenti, enumerazione) può far girare TTS a carico del progetto GCP del proprietario. Per un prodotto venduto a terzi è un rischio da documentare almeno, meglio da mitigare.

**Fix proposto (opzionale, nel `fixed/main.py`):** header `X-API-Key` opzionale — se la env `API_KEY` è impostata, il servizio la richiede; i due nodi HTTP del workflow aggiungono l'header. Alternativa più robusta da documentare: Cloud Run solo-invoker + credenziale predefinita "Google Cloud Run API" nel nodo HTTP Request di n8n.

### 5. 🟡 `async def` con client sincrono (`main.py:22-24`)

`client.synthesize_long_audio()` è una chiamata gRPC bloccante dichiarata dentro una funzione `async def`: blocca l'event loop per tutta la durata della chiamata. Con un utente alla volta non si nota, ma è sbagliato concettualmente e gratuito da correggere: basta `def` (FastAPI esegue le `def` nel threadpool).

### 6. 🟡 Nessuna validazione input

- testo vuoto → chiamata GCP sprecata con errore opaco;
- testo oltre **1.000.000 di byte** (limite della Long Audio Synthesis API) → errore a valle;
- `filename` usato così com'è nell'URI GCS: slash o caratteri strani finiscono nel percorso dell'oggetto.

**Fix:** validazioni 400/413 e sanitizzazione del filename (`[A-Za-z0-9._-]`, tutto il resto → `_`).

### 7-8. 🟢 Packaging Docker/requirements

- Pinnare le dipendenze (`fastapi>=0.115,<1`, ecc.): senza pin, una major release futura spezza le build dei buyer.
- Dockerfile: utente non-root, `EXPOSE 8080`, `PYTHONDONTWRITEBYTECODE=1`, porta da env `PORT` (Cloud Run la inietta; 8080 è solo il default).
- Il file si chiama `Dockerfile.txt`: mantenere (Gumroad/zip convenienze a parte) ma documentare che per il build va rinominato `Dockerfile`, oppure usare `gcloud run deploy --source .` che usa il file così com'è dopo rename. Nelle nuove docs è gestito.

### Cosa è corretto (da tenere)

- Uso della **Long Audio Synthesis** (`TextToSpeechLongAudioSynthesizeClient`): è la scelta giusta per articoli lunghi (la `synthesize` standard si ferma a ~5.000 byte).
- `LINEAR16` come encoding: è l'unico supportato dalla sintesi long-form. ✅
- Input come testo semplice (niente SSML): la sintesi long-form non supporta SSML. ✅
- Scrittura diretta su GCS via `output_gcs_uri`: corretto, l'API non restituisce audio in response. ✅
- Risposta che include `operation.name`: già pronta per un futuro polling dello stato (oggi il workflow non la usa).

---

## Versione corretta

In [`Review/fixed/`](fixed/):

| File | Modifiche |
|------|-----------|
| `main.py` | env vars con fail-fast, `HTTPException` con status corretti, validazione input, sanitizzazione filename, `X-API-Key` opzionale, endpoint `GET /health`, `def` invece di `async def`, porta da `PORT`. **Schema richiesta/risposta invariato** (drop-in replacement, il workflow esistente funziona senza modifiche). |
| `requirements.txt` | versioni pinnate |
| `Dockerfile` | non-root, `EXPOSE`, env Python, porta da `PORT` |
| `.env.example` | template delle variabili (da riempire; su Cloud Run si impostano con `--set-env-vars`) |
