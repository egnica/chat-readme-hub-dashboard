"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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

function formatTitle(filename) {
  return filename
    .replace(/\.md$/i, "")
    .split("-")
    .filter(Boolean)
    .map((word) => WORD_OVERRIDES[word.toLowerCase()] || `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export default function FilePage() {
  const params = useParams();
  const router = useRouter();
  const fileName = useMemo(() => {
    const value = Array.isArray(params?.name) ? params.name[0] : params?.name;
    return value || "";
  }, [params]);

  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("read");
  const [showNote, setShowNote] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadFile() {
    if (!fileName) return;

    setLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch(`/api/file?path=${encodeURIComponent(fileName)}`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load file.");
      }

      setFile(data.file);
      setContent(data.file.content);
      setEditorValue(data.file.content);
    } catch (err) {
      setError(err.message || "Unable to load file.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFile();
  }, [fileName]);

  async function saveContent(nextContent, successMessage) {
    if (!file) return false;

    setSaving(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/file", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: file.path,
          content: nextContent,
          sha: file.sha,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("This file changed on GitHub. Reload it before saving again.");
        }
        throw new Error(data.error || "Unable to save file.");
      }

      const nextFile = { ...file, sha: data.sha || file.sha };
      setFile(nextFile);
      setContent(nextContent);
      setEditorValue(nextContent);
      setMode("read");
      setShowNote(false);
      setNote("");
      setStatus(successMessage || "Saved to GitHub.");
      return true;
    } catch (err) {
      setError(err.message || "Unable to save file.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    const trimmed = note.trim();
    if (!trimmed) return;

    const separator = content.endsWith("\n\n") ? "" : content.endsWith("\n") ? "\n" : "\n\n";
    await saveContent(`${content}${separator}${trimmed}\n`, "Note added to GitHub.");
  }

  async function handleDelete() {
    if (!file) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/file", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.path, sha: file.sha }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete file.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to delete file.");
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="app-shell reader-shell">
      <header className="reader-header">
        <Link href="/" className="back-link">← All notes</Link>
        {!loading && file ? (
          <button className="icon-button" type="button" onClick={loadFile} aria-label="Reload file">↻</button>
        ) : null}
      </header>

      {loading ? (
        <section className="state-card"><p>Loading Markdown…</p></section>
      ) : null}

      {!loading && error && !file ? (
        <section className="state-card error-card">
          <h1>Couldn’t open this note</h1>
          <p>{error}</p>
          <button className="button primary-button" type="button" onClick={loadFile}>Try again</button>
        </section>
      ) : null}

      {!loading && file ? (
        <>
          <section className="reader-title-block">
            <p className="eyebrow">Markdown note</p>
            <h1>{formatTitle(file.name)}</h1>
            <p className="filename">{file.name}</p>
          </section>

          <section className="action-bar" aria-label="File actions">
            {mode === "read" ? (
              <>
                <button className="button primary-button" type="button" onClick={() => { setMode("edit"); setEditorValue(content); setStatus(""); }}>Edit</button>
                <button className="button secondary-button" type="button" onClick={() => { setShowNote(true); setStatus(""); }}>Add note</button>
                <button className="button danger-ghost-button" type="button" onClick={() => setShowDelete(true)}>Delete</button>
              </>
            ) : (
              <>
                <button className="button primary-button" type="button" disabled={saving} onClick={() => saveContent(editorValue, "Changes saved to GitHub.")}>{saving ? "Saving…" : "Save"}</button>
                <button className="button secondary-button" type="button" disabled={saving} onClick={() => { setMode("read"); setEditorValue(content); }}>Cancel</button>
              </>
            )}
          </section>

          {status ? <div className="status-message success-message" role="status">{status}</div> : null}
          {error ? <div className="status-message error-message" role="alert">{error}</div> : null}

          {showNote && mode === "read" ? (
            <section className="note-panel">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Append text</p>
                  <h2>Add a note</h2>
                </div>
                <button className="text-button" type="button" onClick={() => { setShowNote(false); setNote(""); }}>Close</button>
              </div>
              <textarea
                className="note-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add Markdown or plain text to the end of this file…"
                autoFocus
              />
              <button className="button primary-button full-width-button" type="button" disabled={saving || !note.trim()} onClick={handleAddNote}>
                {saving ? "Adding…" : "Add & save"}
              </button>
            </section>
          ) : null}

          {mode === "edit" ? (
            <section className="editor-panel">
              <textarea
                className="markdown-editor"
                value={editorValue}
                onChange={(event) => setEditorValue(event.target.value)}
                spellCheck="true"
                aria-label="Markdown editor"
              />
            </section>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </>
      ) : null}

      {showDelete ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setShowDelete(false); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <p className="eyebrow danger-text">Permanent action</p>
            <h2 id="delete-title">Delete this Markdown file?</h2>
            <p>This removes <strong>{file?.name}</strong> from <code>chat-readme-hub</code> and creates a GitHub commit.</p>
            <div className="modal-actions">
              <button className="button secondary-button" type="button" disabled={deleting} onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="button danger-button" type="button" disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
