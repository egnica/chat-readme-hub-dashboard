"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WORD_OVERRIDES = {
  ai: "AI",
  api: "API",
  aws: "AWS",
  crm: "CRM",
  github: "GitHub",
  readme: "README",
  seo: "SEO",
  sms: "SMS",
  youtube: "YouTube",
};

const CHAT_NOTES_PROJECT_URL = "https://chatgpt.com/g/g-p-6aaf8754de0c8191aefbd0fd7f6c42b2-chat-notes/project";

function formatTitle(filename) {
  return filename
    .replace(/\.md$/i, "")
    .split("-")
    .filter(Boolean)
    .map((word) => WORD_OVERRIDES[word.toLowerCase()] || `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Home() {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFiles() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/files", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load files.");
      }

      setFiles(data.files || []);
    } catch (err) {
      setError(err.message || "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return files;

    return files.filter((file) => {
      const title = formatTitle(file.name).toLowerCase();
      return title.includes(normalized) || file.name.toLowerCase().includes(normalized);
    });
  }, [files, query]);

  return (
    <main className="app-shell dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">GitHub Markdown</p>
          <h1>Chat README Hub</h1>
          <p className="subhead">Browse, edit, add to, or remove notes from your phone.</p>
        </div>
        <button className="icon-button" type="button" onClick={loadFiles} aria-label="Refresh files" disabled={loading}>
          ↻
        </button>
      </header>

      <section aria-label="Start a Chat Note" style={{ marginBottom: "18px" }}>
        <a
          className="button primary-button full-width-button"
          href={CHAT_NOTES_PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          🎙 Start Chat Note
        </a>
      </section>

      <section className="dashboard-controls" aria-label="File tools">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
          />
        </label>
        <div className="file-count" aria-live="polite">
          {loading ? "Loading…" : `${filteredFiles.length} ${filteredFiles.length === 1 ? "file" : "files"}`}
        </div>
      </section>

      {error ? (
        <section className="state-card error-card">
          <h2>Couldn’t load the repository</h2>
          <p>{error}</p>
          <button className="button primary-button" type="button" onClick={loadFiles}>Try again</button>
        </section>
      ) : null}

      {!error && loading ? (
        <section className="file-list" aria-label="Loading files">
          {[0, 1, 2, 3].map((item) => <div className="file-card skeleton-card" key={item} />)}
        </section>
      ) : null}

      {!error && !loading && filteredFiles.length === 0 ? (
        <section className="state-card">
          <h2>{query ? "No matching notes" : "No Markdown files yet"}</h2>
          <p>{query ? "Try a different search." : "Add a .md file to chat-readme-hub and it will appear here."}</p>
        </section>
      ) : null}

      {!error && !loading && filteredFiles.length > 0 ? (
        <section className="file-list" aria-label="Markdown files">
          {filteredFiles.map((file) => (
            <Link className="file-card" href={`/file/${encodeURIComponent(file.name)}`} key={file.path}>
              <div className="file-card-copy">
                <h2>{formatTitle(file.name)}</h2>
                <p>{file.name}</p>
              </div>
              <div className="file-card-meta">
                <span>{formatSize(file.size)}</span>
                <span className="chevron" aria-hidden="true">›</span>
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      <footer className="dashboard-footer">
        <span>Source: egnica/chat-readme-hub</span>
      </footer>
    </main>
  );
}
