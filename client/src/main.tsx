import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import PublicMobileCompactHeaderRuntime from "./components/PublicMobileCompactHeaderRuntime";
import PublicSalesCopyRuntime, { PublicSalesCopyProvider } from "./components/PublicSalesCopyRuntime";
import { withAppBase } from "./lib/devPath";
import "./index.css";
import "./dashboard-premium.css";
import "./c1-obsidian-emerald.css";
import "./home-spacing-fixes.css";
import "./public-mobile-compact-header.css";
import "./admin-academy-mobile.css";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: withAppBase("/api/trpc"),
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
        <PublicSalesCopyProvider>
          <App />
          <PublicSalesCopyRuntime />
          <PublicMobileCompactHeaderRuntime />
        </PublicSalesCopyProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
