# ted_faiss_store.py
"""
TED dataset ingestion + FAISS index builder + integration helpers.

Assumptions:
 - Kaggle dataset CSVs are available locally.
 - Requires: pandas, sqlite3 (std), sentence-transformers, faiss, numpy
 - Optional: whisper, google ADK imports (kept for your agent code)
"""

import os
import sqlite3
import json
import math
from typing import List, Dict, Any, Optional

import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer

# ---------------------------
# Configuration
# ---------------------------
DB_PATH = os.getenv("TED_DB_PATH", "ted_data.sqlite3")
FAISS_INDEX_PATH = os.getenv("TED_FAISS_IDX", "ted_faiss.index")
DOCMAP_PATH = os.getenv("TED_DOCMAP", "ted_docmap.json")  # fallback mapping for doc_id -> metadata
EMBED_MODEL_NAME = os.getenv("TED_EMB_MODEL", "all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("TED_CHUNK_SIZE", "400"))  # characters per chunk
CHUNK_OVERLAP = int(os.getenv("TED_CHUNK_OVERLAP", "80"))

# ---------------------------
# DB Utilities
# ---------------------------
def get_conn(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_schema(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS speakers (
        speaker_id   INTEGER PRIMARY KEY,
        name         TEXT,
        bio          TEXT,
        location     TEXT,
        affiliation  TEXT,
        other_meta   JSON
    );

    CREATE TABLE IF NOT EXISTS talks (
        talk_id      INTEGER PRIMARY KEY,
        talk_uid     TEXT UNIQUE,
        title        TEXT,
        description  TEXT,
        author       TEXT,
        speaker_id   INTEGER,
        event        TEXT,
        url          TEXT,
        year         INTEGER,
        duration     INTEGER,
        language     TEXT,
        other_meta   JSON,
        FOREIGN KEY (speaker_id) REFERENCES speakers(speaker_id)
    );

    CREATE TABLE IF NOT EXISTS transcripts (
        transcript_id INTEGER PRIMARY KEY,
        talk_id       INTEGER,
        transcript    TEXT,
        segments_json JSON,
        length_tokens INTEGER,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (talk_id) REFERENCES talks(talk_id)
    );

    CREATE TABLE IF NOT EXISTS faiss_docs (
        doc_id       INTEGER PRIMARY KEY,
        talk_id      INTEGER,
        transcript_id INTEGER,
        chunk_start  INTEGER,
        chunk_end    INTEGER,
        text_snippet TEXT,
        embedding_dim INTEGER,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (talk_id) REFERENCES talks(talk_id),
        FOREIGN KEY (transcript_id) REFERENCES transcripts(transcript_id)
    );

    CREATE TABLE IF NOT EXISTS index_meta (
        name TEXT PRIMARY KEY,
        value TEXT
    );
    """)
    conn.commit()

# ---------------------------
# CSV ingestion
# ---------------------------
def ingest_csvs(speaker_csv: str, talk_csv: str, transcript_csv: str, conn: Optional[sqlite3.Connection] = None):
    close_conn = False
    if conn is None:
        conn = get_conn()
        close_conn = True
    init_schema(conn)
    cur = conn.cursor()

    print("➡️  Reading CSVs")
    sp_df = pd.read_csv(speaker_csv)
    talk_df = pd.read_csv(talk_csv)
    tr_df = pd.read_csv(transcript_csv)

    # --- speakers
    print("➡️  Ingesting speakers")
    for _, r in sp_df.fillna("").iterrows():
        # Map columns that exist in the CSV; adapt names as needed
        name = r.get("name") or r.get("author") or r.get("speaker")
        bio = r.get("bio") or ""
        location = r.get("location") or ""
        affiliation = r.get("affiliation") or ""
        other = {}
        # you can add other columns to other_meta
        cur.execute("""
            INSERT INTO speakers (name, bio, location, affiliation, other_meta)
            VALUES (?, ?, ?, ?, ?)
        """, (name, bio, location, affiliation, json.dumps(other)))
    conn.commit()

    # Build a small speaker name -> id map for linking (naive, may require better matching)
    cur.execute("SELECT speaker_id, name FROM speakers")
    speaker_rows = cur.fetchall()
    speaker_map = {r["name"]: r["speaker_id"] for r in speaker_rows}

    # --- talks
    print("➡️  Ingesting talks")
    for _, r in talk_df.fillna("").iterrows():
        talk_uid = r.get("talk_id") or r.get("uid") or r.get("talk_uid") or ""
        title = r.get("title") or ""
        description = r.get("description") or r.get("description_text") or ""
        author = r.get("author") or r.get("speaker") or ""
        speaker_id = speaker_map.get(author)
        event = r.get("event") or ""
        url = r.get("url") or ""
        year = int(r.get("year")) if r.get("year") not in (None, "") else None
        duration = int(r.get("duration")) if r.get("duration") not in (None, "") else None
        language = r.get("language") or ""
        other_meta = {}
        try:
            cur.execute("""
                INSERT OR IGNORE INTO talks (talk_uid, title, description, author, speaker_id, event, url, year, duration, language, other_meta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (talk_uid, title, description, author, speaker_id, event, url, year, duration, language, json.dumps(other_meta)))
        except Exception as e:
            print("Talk insert error:", e)
    conn.commit()

    # --- transcripts
    print("➡️  Ingesting transcripts")
    # transcript csv expected columns: talk_id or talk_uid/title, transcript text
    for _, r in tr_df.fillna("").iterrows():
        # try to resolve talk_id from talk_df keys
        talk_uid = r.get("talk_id") or r.get("talk_uid") or r.get("uid") or ""
        full_text = r.get("transcript") or r.get("text") or ""
        segments_json = r.get("segments") if "segments" in r else None

        # find matching talk_id
        cur.execute("SELECT talk_id FROM talks WHERE talk_uid = ? OR title = ? OR author = ? LIMIT 1", (talk_uid, r.get("title"), r.get("author")))
        found = cur.fetchone()
        talk_id = found["talk_id"] if found else None

        cur.execute("""
            INSERT INTO transcripts (talk_id, transcript, segments_json, length_tokens)
            VALUES (?, ?, ?, ?)
        """, (talk_id, full_text, json.dumps(segments_json) if segments_json is not None else None, len(full_text.split())))
    conn.commit()

    if close_conn:
        conn.close()
    print("✅ Ingestion complete")

# ---------------------------
# Chunking helper
# ---------------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[Dict[str, Any]]:
    """
    Splits text into overlapping chunks (character-based for simplicity).
    Returns list of dicts: {start, end, text}
    """
    if not text:
        return []
    chunks = []
    start = 0
    L = len(text)
    while start < L:
        end = min(start + chunk_size, L)
        snippet = text[start:end]
        chunks.append({"start": start, "end": end, "text": snippet})
        if end == L:
            break
        start = max(0, end - overlap)
    return chunks

# ---------------------------
# FAISS Index builder
# ---------------------------
class TedFaissStore:
    def __init__(self, db_path: str = DB_PATH, index_path: str = FAISS_INDEX_PATH, model_name: str = EMBED_MODEL_NAME):
        self.db_path = db_path
        self.index_path = index_path
        self.model = SentenceTransformer(model_name)
        self.index: Optional[faiss.Index] = None
        self.doc_count = 0
        self.dim = None

    def build_index_from_db(self, conn: Optional[sqlite3.Connection] = None, persist: bool = True, max_rows: Optional[int] = None):
        close_conn = False
        if conn is None:
            conn = get_conn(self.db_path)
            close_conn = True

        cur = conn.cursor()
        # Read transcripts
        cur.execute("SELECT transcript_id, talk_id, transcript FROM transcripts")
        rows = cur.fetchall()
        all_chunks = []
        mapping_rows = []  # to insert into faiss_docs
        doc_id = 0

        print("➡️  Building chunks and embeddings")
        for r in rows:
            t_id = r["transcript_id"]
            talk_id = r["talk_id"]
            text = r["transcript"] or ""
            chunks = chunk_text(text)
            for c in chunks:
                mapping_rows.append((doc_id, talk_id, t_id, c["start"], c["end"], c["text"]))
                all_chunks.append(c["text"])
                doc_id += 1
                if max_rows and doc_id >= max_rows:
                    break
            if max_rows and doc_id >= max_rows:
                break

        if not all_chunks:
            print("⚠️ No chunks to index.")
            if close_conn:
                conn.close()
            return

        # embeddings
        embeddings = self.model.encode(all_chunks, show_progress_bar=True, convert_to_numpy=True)
        embeddings = embeddings.astype('float32')
        self.dim = embeddings.shape[1]

        # create index (use IndexFlatIP with normalization OR IndexFlatL2)
        # We'll use inner product on normalized vectors as common similarity.
        print("➡️  Normalizing embeddings and building FAISS index")
        # normalize for cosine via L2 normalization
        faiss.normalize_L2(embeddings)

        index = faiss.IndexFlatIP(self.dim)
        index.add(embeddings)
        self.index = index
        self.doc_count = len(all_chunks)

        # persist mapping into DB: faiss_docs
        print("➡️  Persisting FAISS mapping to DB")
        cur.executemany("""
            INSERT OR REPLACE INTO faiss_docs (doc_id, talk_id, transcript_id, chunk_start, chunk_end, text_snippet, embedding_dim)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [(m[0], m[1], m[2], m[3], m[4], m[5], self.dim) for m in mapping_rows])
        conn.commit()

        # persist index to disk
        if persist:
            print(f"➡️  Writing index to {self.index_path}")
            faiss.write_index(index, self.index_path)
            # also write a small JSON docmap if needed
            docs = []
            cur.execute("SELECT doc_id, talk_id, transcript_id, text_snippet FROM faiss_docs ORDER BY doc_id ASC")
            for rr in cur.fetchall():
                docs.append({"doc_id": rr["doc_id"], "talk_id": rr["talk_id"], "transcript_id": rr["transcript_id"], "text": rr["text_snippet"]})
            with open(DOCMAP_PATH, "w") as fh:
                json.dump(docs, fh, indent=2)
            # store index metadata
            cur.execute("INSERT OR REPLACE INTO index_meta (name, value) VALUES (?, ?)", ("faiss_index_path", self.index_path))
            conn.commit()

        if close_conn:
            conn.close()
        print(f"✅ Built FAISS index with {self.doc_count} vectors (dim={self.dim})")

    def load_index(self):
        if not os.path.exists(self.index_path):
            raise FileNotFoundError(f"Index file not found at {self.index_path}")
        print(f"➡️ Loading index from {self.index_path}")
        self.index = faiss.read_index(self.index_path)
        # set dim
        self.dim = self.index.d
        print("✅ Index loaded (dim=%d, ntotal=%d)" % (self.dim, self.index.ntotal))

    def semantic_search(self, query: str, top_k: int = 5, conn: Optional[sqlite3.Connection] = None) -> List[Dict[str, Any]]:
        if self.index is None:
            self.load_index()

        q_emb = self.model.encode([query], convert_to_numpy=True).astype('float32')
        faiss.normalize_L2(q_emb)
        D, I = self.index.search(q_emb, top_k)
        hits = []
        if conn is None:
            conn = get_conn(self.db_path)
            close_conn = True
        else:
            close_conn = False
        cur = conn.cursor()

        for dist, idx in zip(D[0], I[0]):
            if idx < 0:
                continue
            cur.execute("SELECT doc_id, talk_id, transcript_id, text_snippet FROM faiss_docs WHERE doc_id = ?", (int(idx),))
            rr = cur.fetchone()
            if not rr:
                continue
            cur.execute("SELECT title, author FROM talks WHERE talk_id = ?", (rr["talk_id"],))
            talk = cur.fetchone()
            hits.append({
                "doc_id": int(rr["doc_id"]),
                "talk_id": rr["talk_id"],
                "title": talk["title"] if talk else None,
                "author": talk["author"] if talk else None,
                "snippet": rr["text_snippet"],
                "score": float(dist)
            })
        if close_conn:
            conn.close()
        return hits

# ---------------------------
# Integration: replace TedVectorStore
# ---------------------------
# We'll export a thin wrapper so your agents can still call something like vector_store.semantic_search
class TedVectorStoreAdapter:
    def __init__(self, db_path: str = DB_PATH, index_path: str = FAISS_INDEX_PATH, model_name: str = EMBED_MODEL_NAME):
        self.store = TedFaissStore(db_path, index_path, model_name)

    def ensure_ready(self):
        if self.store.index is None:
            if os.path.exists(self.store.index_path):
                try:
                    self.store.load_index()
                except Exception as e:
                    raise
            else:
                # attempt to build index from DB
                self.store.build_index_from_db()

    def ingest_and_build(self, speaker_csv: str, talk_csv: str, transcript_csv: str, max_index_rows: Optional[int] = None):
        # ingest CSVs -> DB
        conn = get_conn(self.store.db_path)
        ingest_csvs(speaker_csv, talk_csv, transcript_csv, conn=conn)
        # build FAISS index
        self.store.build_index_from_db(conn=conn, persist=True, max_rows=max_index_rows)
        conn.close()

    def semantic_search(self, query: str, top_k: int = 3):
        self.ensure_ready()
        return self.store.semantic_search(query, top_k=top_k)

# ---------------------------
# Example usage when executed as script
# ---------------------------
def _example_run():
    # set paths (adapt)
    speaker_csv = "/kaggle/input/ted-talk-transcripts-2006-2021/speaker_data.csv"
    talk_csv = "/kaggle/input/ted-talk-transcripts-2006-2021/talk_data.csv"
    transcript_csv = "/kaggle/input/ted-talk-transcripts-2006-2021/transcript_data.csv"

    adapter = TedVectorStoreAdapter()
    # Step 1: ingest CSVs and build index (this may take time)
    print("STEP A: Ingesting CSVs into SQLite and building FAISS index (first 1000 chunks for speed)")
    adapter.ingest_and_build(speaker_csv, talk_csv, transcript_csv, max_index_rows=1000)

    # Step B: semantic search
    query = "space exploration and missions to Mars"
    print("STEP B: Semantic search for:", query)
    hits = adapter.semantic_search(query, top_k=5)
    print("Top matches:")
    for h in hits:
        print(h)

if __name__ == "__main__":
    _example_run()
