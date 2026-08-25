import { Check, Copy, Save, StickyNote, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type GlobalNote = {
  path: string;
  note: string;
  updatedAt: string;
};

type GlobalNotesStore = Record<string, GlobalNote>;

const STORAGE_KEY = "pagina-lucrativa.global-notes.v1";

function readNotes(): GlobalNotesStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as GlobalNotesStore;
  } catch {
    return {};
  }
}

function writeNotes(notes: GlobalNotesStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function GlobalNotes() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<GlobalNotesStore>({});
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentPath = useMemo(() => {
    if (typeof window === "undefined") return location || "/";
    return window.location.pathname || location || "/";
  }, [location]);

  const recentNotes = useMemo(() => {
    return Object.values(notes)
      .filter((item) => item.note.trim().length > 0)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 4);
  }, [notes]);

  useEffect(() => {
    const storedNotes = readNotes();
    setNotes(storedNotes);
    setDraft(storedNotes[currentPath]?.note ?? "");
    setFeedback("");
  }, [currentPath]);

  const currentNote = notes[currentPath];
  const hasDraft = draft.trim().length > 0;

  const handleSave = () => {
    const cleanDraft = draft.trimEnd();
    const nextNotes = { ...notes };

    if (cleanDraft.trim()) {
      nextNotes[currentPath] = {
        path: currentPath,
        note: cleanDraft,
        updatedAt: new Date().toISOString(),
      };
      setFeedback("Nota salva");
    } else {
      delete nextNotes[currentPath];
      setFeedback("Nota removida");
    }

    setNotes(nextNotes);
    writeNotes(nextNotes);
  };

  const handleCopy = async () => {
    if (!hasDraft || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(draft);
    setFeedback("Nota copiada");
  };

  const handleClear = () => {
    const nextNotes = { ...notes };
    delete nextNotes[currentPath];
    setDraft("");
    setNotes(nextNotes);
    writeNotes(nextNotes);
    setFeedback("Nota removida");
  };

  return (
    <aside className={`global-notes${open ? " global-notes-open" : ""}`} aria-label="Global Notes">
      {open && (
        <section className="global-notes-panel" role="dialog" aria-modal="false" aria-labelledby="global-notes-title">
          <header className="global-notes-header">
            <div>
              <span>Notas da página</span>
              <h2 id="global-notes-title">Global Notes</h2>
            </div>
            <button type="button" className="global-notes-icon-button" onClick={() => setOpen(false)} aria-label="Fechar Global Notes">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="global-notes-route" title={currentPath}>
            {currentPath}
          </div>

          <label className="global-notes-field">
            <span>O que precisa ser ajustado nesta página?</span>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setFeedback("");
              }}
              rows={7}
              aria-label="Nota desta página"
              placeholder="Digite aqui a alteração, observação ou teste que precisa ser feito nesta página."
            />
          </label>

          <div className="global-notes-actions">
            <button type="button" className="global-notes-primary" onClick={handleSave}>
              <Save size={16} aria-hidden="true" />
              Salvar nota
            </button>
            <button type="button" className="global-notes-secondary" onClick={handleCopy} disabled={!hasDraft}>
              <Copy size={15} aria-hidden="true" />
              Copiar
            </button>
            <button type="button" className="global-notes-secondary" onClick={handleClear} disabled={!currentNote && !hasDraft}>
              <Trash2 size={15} aria-hidden="true" />
              Limpar
            </button>
          </div>

          <div className="global-notes-status" aria-live="polite">
            {feedback && (
              <>
                <Check size={15} aria-hidden="true" />
                {feedback}
              </>
            )}
          </div>

          {recentNotes.length > 0 && (
            <div className="global-notes-recent">
              <span>Notas recentes</span>
              {recentNotes.map((item) => (
                <button
                  type="button"
                  key={item.path}
                  className={item.path === currentPath ? "is-current" : ""}
                  onClick={() => {
                    setDraft(item.note);
                    setFeedback(item.path === currentPath ? "" : "Nota carregada");
                  }}
                >
                  <strong>{item.path}</strong>
                  <small>{formatDate(item.updatedAt)}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        className="global-notes-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar Global Notes" : "Abrir Global Notes"}
        aria-expanded={open}
      >
        <StickyNote size={18} aria-hidden="true" />
        <span>Notas</span>
      </button>
    </aside>
  );
}
