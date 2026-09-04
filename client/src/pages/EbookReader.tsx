import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import ResponsiveEbookFrame from "@/components/ResponsiveEbookFrame";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BookOpenText, LibraryBig, LayoutDashboard, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const menu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/membros", group: "Navegação" },
  { icon: LibraryBig, label: "E-books", path: "/membros/ebooks", group: "Navegação" },
];

export default function EbookReader() {
  const ebooks = trpc.member.ebooks.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);

  useEffect(() => {
    if (selectedId === null && ebooks.data?.[0]) setSelectedId(ebooks.data[0].id);
  }, [ebooks.data, selectedId]);

  const selected = trpc.member.ebook.useQuery({ id: selectedId ?? 0 }, { enabled: selectedId !== null });
  const selectedSummary = ebooks.data?.find(ebook => ebook.id === selectedId);
  const readerTitle = selected.data?.title ?? selectedSummary?.title ?? "Abrindo e-book";
  const readerSummary = selected.data?.summary ?? selectedSummary?.summary ?? "Aguarde enquanto o material é carregado.";

  const openEbook = (ebookId: number) => {
    setSelectedId(ebookId);
    setReaderOpen(true);
  };

  const handleReaderOpenChange = (open: boolean) => {
    if (!open && typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    setReaderOpen(open);
  };

  const handleDialogEscape = (event: KeyboardEvent) => {
    if (typeof document === "undefined" || !document.fullscreenElement) return;
    event.preventDefault();
    void document.exitFullscreen().catch(() => undefined);
  };

  return (
    <DashboardLayout menuItems={menu} title="Biblioteca de execução">
      <main className="mx-auto w-full max-w-7xl min-w-0 space-y-7 overflow-x-hidden p-4 sm:p-8">
        <header className="min-w-0 space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-300">Biblioteca de execução</span>
          <h1 className="break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">E-books e materiais de estudo</h1>
          <p className="max-w-3xl break-words text-sm leading-6 text-zinc-300">
            Consulte e-books publicados diretamente no navegador. A leitura fica restrita aos conteúdos liberados para a sua conta.
          </p>
        </header>

        {ebooks.isLoading ? (
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm text-zinc-300">
            <LoaderCircle className="size-4 animate-spin text-emerald-300" />
            Carregando biblioteca...
          </div>
        ) : ebooks.data?.length ? (
          <>
            <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-3 sm:p-5">
              <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-xs font-medium uppercase tracking-wider text-zinc-500">{ebooks.data.length} materiais publicados</p>
                  <h2 className="mt-1 break-words text-lg font-semibold leading-snug text-white">Escolha um e-book para abrir o leitor.</h2>
                </div>
                <p className="max-w-full break-words text-xs leading-5 text-zinc-400 sm:max-w-sm sm:text-right">O conteúdo abre em uma janela de leitura sem sair da biblioteca.</p>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {ebooks.data.map(ebook => {
                  const isActive = selectedId === ebook.id;
                  return (
                    <button
                      type="button"
                      key={ebook.id}
                      onClick={() => openEbook(ebook.id)}
                      aria-pressed={isActive && readerOpen}
                      className={`min-w-0 rounded-xl border p-4 text-left transition hover:border-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 ${isActive ? "border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-black/25"}`}
                    >
                      <div className="flex min-w-0 gap-3">
                        <BookOpenText className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-medium leading-snug text-white">{ebook.title}</h3>
                          <p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-zinc-400">{ebook.summary || "Material de estudo publicado."}</p>
                          <span className="mt-3 inline-flex text-xs font-semibold text-emerald-200">Abrir leitura</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <Dialog open={readerOpen} onOpenChange={handleReaderOpenChange}>
              <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={handleDialogEscape}
                className="fixed inset-0 left-0 top-0 grid h-[100dvh] max-h-[100dvh] w-[100dvw] max-w-[100dvw] translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-none border-white/10 bg-zinc-950 p-0 text-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(92dvh,920px)] sm:max-h-[92dvh] sm:w-[min(1120px,calc(100dvw-2rem))] sm:max-w-[min(1120px,calc(100dvw-2rem))] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl"
              >
                <DialogHeader className="min-w-0 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] text-left sm:px-5 sm:pt-5">
                  <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Leitura selecionada</span>
                      <DialogTitle className="mt-1 break-words text-base font-semibold leading-snug text-white sm:text-xl">{readerTitle}</DialogTitle>
                      <DialogDescription className="mt-1 line-clamp-2 break-words text-xs leading-5 text-zinc-400 sm:text-sm">
                        {readerSummary}
                      </DialogDescription>
                    </div>
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-zinc-300 transition hover:border-emerald-300/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                        aria-label="Fechar leitor"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </DialogClose>
                  </div>
                </DialogHeader>

                <div className="min-h-0 min-w-0 overflow-hidden px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:p-4">
                  {selected.isLoading ? (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 text-sm text-zinc-400">
                      <LoaderCircle className="size-4 animate-spin text-emerald-300" />
                      Abrindo e-book...
                    </div>
                  ) : selected.isError ? (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 p-6 text-center text-sm text-zinc-400">
                      Não foi possível carregar este material. Feche o leitor e tente abrir novamente.
                    </div>
                  ) : selected.data ? (
                    <ResponsiveEbookFrame
                      title={`Leitor de ${selected.data.title}`}
                      htmlContent={selected.data.htmlContent}
                      displayMode="modal"
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full min-h-[55dvh] min-w-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 p-6 text-center text-sm text-zinc-400">
                      Selecione um e-book para iniciar a leitura.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/60 p-8 text-center">
            <LibraryBig className="mx-auto size-8 text-emerald-300" />
            <h2 className="mt-3 break-words text-lg font-medium text-white">Nenhum e-book publicado</h2>
            <p className="mt-2 break-words text-sm text-zinc-400">Quando a administração liberar materiais, eles aparecerão nesta biblioteca.</p>
          </section>
        )}
      </main>
    </DashboardLayout>
  );
}
