# Review Workflow n8n — "WordPress-VoiceOvers" (v1.1)

**File:** `Workflow/WordPress_VoiceOvers_withAI_GoogleCloud_updated.json` — 19 nodi funzionali + 8 sticky note.
**Verdetto:** l'architettura è valida (coda su Google Sheets, un articolo per run, due pipeline linguistiche parallele) e le sticky note sono un bel tocco per un prodotto venduto. Il problema principale **non è la logica ma il packaging**: il JSON distribuito contiene placeholder incoerenti tra loro e il bucket name hardcoded, quindi **un buyer che segue la guida v1 ottiene un flusso rotto**. C'è poi una serie di miglioramenti di robustezza da valutare per una v1.3.

---

## A. Problemi di packaging (bloccanti per il prodotto venduto)

### A1. 🔴 I tre nodi Google Sheets puntano a documenti diversi

- **"Google Sheets"** (scrittura coda): `documentId = 1-DOCUMENT_ID` → placeholder ✅
- **"Google Sheets2"** (lettura coda): `documentId = 1-qkYalPWAugIUGqsgR8_gU15CHkzsqQfCVB793i8Ku8` → **il tuo sheet reale di produzione**
- **"Google Sheets1"** (Status=done): stesso ID reale

Chi compra sostituisce l'ID nel primo nodo (come dice la guida) e il flusso **legge e scrive su due fogli diversi**: la coda non viene mai letta, nessun articolo viene processato. In più il tuo ID di produzione è distribuito nel pacchetto a pagamento (se quel foglio fosse mai condiviso via link, sarebbe leggibile).

**Fix (applicato in `fixed/WordPress_VoiceOvers_v1.2.json`):** tutti e tre i nodi → `1-DOCUMENT_ID`.

### A2. 🔴 Bucket hardcoded `wp-voiceovers` nei nodi WordPress update

Entrambi i nodi *Update VoiceOvers Page* scrivono il player con:

```
https://storage.googleapis.com/wp-voiceovers/{{ ID }}.wav
```

mentre la guida v1 dice di creare il bucket `voiceover-audio-files`. Il buyer che segue la guida genera audio nel bucket giusto ma **i player pubblicati puntano al bucket sbagliato** → 404 permanenti.

**Fix:** nelle nuove docs il bucket richiesto è esattamente `wp-voiceovers` (opzione più semplice per il buyer), con nota esplicita su quali URL cambiare se vuole un nome diverso. Nel JSON il nome resta (comportamento invariato), ma ora è coerente con la documentazione.

### A3. 🟡 JSON distribuito con metadati di produzione

`active: true`, `id`, `versionId`, `meta.instanceId` e i tag `PROD`/`Website`/`creator-paid-release` sono i tuoi dati di istanza. Non ci sono segreti (gli ID credenziale sono solo riferimenti), ma per pulizia il JSON v1.2 esce con `active: false` e senza `id`/`versionId`/`meta`/`tags`.

### A4. 🟢 Nomi nodi inconsistente

- `"| Update VoiceOvers Page EN"` → pipe iniziale (typo)
- `"Wordpress| Update VoiceOvers Page IT"` → pipe attaccata

Rinominati in `Wordpress | Update …` nel v1.2 (le connection sono state aggiornate di conseguenza).

---

## B. Problemi funzionali (comportamento)

### B1. 🟡 TTS asincrono, ma pubblicazione immediata (race condition)

Il microservizio **avvia** l'operazione long-form e ritorna subito `"status": "started"`. Il workflow a quel punto GETta la pagina WP e pubblica il player **senza aspettare la fine della sintesi** (che per articoli lunghi richiede decine di secondi–minuti). Chi visita la pagina in quella finestra trova un player che non parte (il file ancora non esiste nel bucket).

Impatto reale: contenuto (il browser scarica l'audio quando il visitatore apre la pagina, quindi il 404 è temporaneo), ma è il limite più importante da conoscere. Il `Wait` da 15 secondi che c'è è nell'altro ramo (tra scrittura e lettura della coda), non qui.

**Miglioramento suggerito (v1.3):** dopo il POST `/long-tts`, loop `Wait 60s → GET https://texttospeech.googleapis.com/v1/operations/{operation}` finché `done: true`, oppure esporre `/long-tts/status` nel microservizio. Oppure, più semplice: un `Wait` di 60-120s fisso prima dell'update WP.

### B2. 🟡 Append non idempotente → player duplicati in caso di retry

`Status=done` viene scritto solo alla fine. Se l'esecuzione fallisce a metà (es. OpenAI 429 dopo il TTS EN), al run successivo l'articolo viene rifatto **e il player ri-appeso** alla pagina. Il blocco pubblicato contiene già il testo `PostID: {id}` → si può aggiungere un controllo IF sul contenuto della pagina prima di appendere. Da valutare in v1.3.

### B3. 🟡 `Wordpress getAll` con data fissa e `returnAll`

`options.after = "2023-11-07T23:00:00"` fissa + `returnAll: true`: ad ogni run scarica **tutti** i post dal 7/11/2023, e la lista cresce per sempre (tempo di esecuzione e API call crescenti). Suggerimento: data dinamica tipo `={{ $now.minus({ months: 3 }).toISO() }}`, oppure limitare il fetch. Non applicato nel v1.2 (cambierebbe quali post entrano in coda), segnalato nelle docs.

### B4. 🟡 MIME sbagliato: `type="audio/mpeg"` per file `.wav`

Nei due nodi update. I browser di solito sniffano e suonano lo stesso, ma il valore corretto è `audio/wav`. **Corretto nel v1.2.**

### B5. 🟡 Nome voce con case incoerente: `IT-IT-Neural2-F`

Nel nodo *HTTP GCP TTS IT* la voce è `IT-IT-Neural2-F`; il catalogo Google è `it-IT-Neural2-F` (come correttamente usato per `en-US-Neural2-D`). La API è tollerante, ma il valore canonico è più sicuro. **Corretto nel v1.2.**

### B6. 🟡 Schedule Trigger: dipende dal timezone dell'istanza

`triggerAtHour: 22` usa il timezone dell'istanza n8n (self-hosted default: America/New_York). Da documentare: impostare il timezone desiderato (env `GENERIC_TIMEZONE` o Settings dell'istanza) — aggiunto alle docs.

### B7. 🟢 `gpt-4o` per la pulizia del testo

Due chiamate per articolo con gpt-4o per un task di pulizia: `gpt-4o-mini` è ~15x più economico con qualità più che sufficiente. Suggerito nelle docs (Customization), non imposto nel JSON.

### B8. 🟢 Dettagli minori (ok così, ma da sapere)

- `Wait 15s` tra scrittura e lettura dello stesso sheet: hack ragionevole per far propagare l'appendOrUpdate; documentato.
- `Code | Clean` ordina per `Date` via `new Date(...)`: date_gmt senza timezone → confronto comunque consistente. OK.
- Update WP che ri-salva `content.rendered` (context `view`): al primo update i blocchi Gutenberg della pagina vengono "appiattiti" in HTML. La pagina è solo una lista di player, quindi va bene; nota nelle docs.
- `alwaysOutputData: true` sul Code di pulizia HTML: se un post ha contenuto vuoto produce `text: undefined` a valle; guard edge case da valutare in v1.3.
- Google Translate riceve `Title + Content` concatenati **senza separatore**: il titolo finisce attaccato al testo (funziona perché l'IT pulito poi passa da OpenAI, e nel ramo EN il titolo viene letto all'inizio dell'audio — presumibilmente voluto). Da sapere.

---

## C. Limiti della Long Audio Synthesis da tenere presenti (verificati sulle docs Google)

- Input max **1.000.000 di byte** (~1 MB) per richiesta → ok per articoli blog, no per libri.
- Solo encoding **LINEAR16/WAV** in output (per questo i file sono `.wav`; l'MIME del player dev'essere `audio/wav`).
- **SSML non supportato**, solo testo plain (il codice è già corretto così).
- Non tutte le voci del catalogo supportano la sintesi long-form; le Neural2 usate di default sì. Se una voce viene rifiutata, sceglierne un'altra dalla lista Voices.
- Il `parent` nelle docs ufficiali è `projects/{PROJECT_NUMBER}/locations/{LOCATION}`; il project ID di solito funziona, ma in caso di 403/404 provare il project number.
- Feature in Preview lato Google: possibile incontro con errori `429 ResourceExhausted` se si lanciano molte operazioni in parallelo (con un articolo per run non succede).

Fonti: [Long Audio Synthesis quickstart](https://cloud.google.com/text-to-speech/docs/create-audio-text-long-audio-synthesis), [Pricing TTS](https://cloud.google.com/text-to-speech/pricing).

---

## D. Cosa contiene `fixed/WordPress_VoiceOvers_v1.2.json`

Solo fix di packaging/correttezza, **nessun cambiamento di comportamento**:

1. I 3 nodi Google Sheets → stesso placeholder `1-DOCUMENT_ID` (+ nomi coerenti).
2. `type="audio/mpeg"` → `type="audio/wav"` nei 2 nodi update.
3. `IT-IT-Neural2-F` → `it-IT-Neural2-F`.
4. Nomi nodi update WP normalizzati (+ connection aggiornate).
5. `active: false`; rimossi `id`, `versionId`, `meta`, `tags`.

## E. Roadmap suggerita v1.3 (non applicata)

1. Attesa/polling del completamento TTS prima di pubblicare (B1).
2. Append idempotente (IF su `PostID:` già presente) (B2).
3. `after` dinamico nel getAll WordPress (B3).
4. `gpt-4o-mini` + `retryOnFail` sui nodi OpenAI/HTTP (B7).
5. Sostituire i due nodi Code "extract" usando `simplify: true` sui nodi OpenAI (semplifica la mappa JSON).
6. Un'unica chiamata OpenAI "traduci + pulisci" per il ramo EN (dimezza i costi LLM, perde però Google Translate).
7. Nodo IF di guardia per articoli senza contenuto / già presenti in pagina.
