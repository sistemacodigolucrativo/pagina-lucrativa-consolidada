import "dotenv/config";
import express, { type RequestHandler } from "express";
import { createServer, type ServerResponse } from "http";
import net from "net";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerAffiliateLinkTracking } from "./affiliateLinkTracking";
import { registerCampaignRedirectRoutes } from "./campaignRedirect";
import { registerPublicToastConfig } from "./publicToastConfig";
import { registerPublicSalesCopyConfig } from "./publicSalesCopyConfig";
import { registerDeployStatus } from "./deployStatus";
import { registerAdminManualDeploy } from "./manualDeploy";
import { registerAdminMemberManagement } from "./adminMemberManagement";
import { registerAdminContentManagement } from "./adminContentManagement";
import { registerAdminRelationshipMaintenance } from "./adminRelationshipMaintenance";
import { registerAdminCommercialOperations } from "./adminCommercialOperations";
import { serveStatic, setupVite } from "./vite";
import { PACKAGED_EBOOK_FILE_ROUTE } from "../staticEbooks";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function createPackagedEbookFilesMiddleware(): RequestHandler {
  const importRoot = process.env.EBOOK_IMPORT_ROOT || path.resolve(process.cwd(), "ebook-import");
  const pdfRoot = path.join(importRoot, "fontes_importados");
  const staticPdfFiles = express.static(pdfRoot, {
    fallthrough: false,
    setHeaders(response: ServerResponse, filePath: string) {
      if (!filePath.toLowerCase().endsWith(".pdf")) return;
      response.setHeader("Cache-Control", "public, max-age=86400");
      response.setHeader("Content-Disposition", "inline");
      response.setHeader("Content-Type", "application/pdf");
      response.setHeader("X-Content-Type-Options", "nosniff");
    },
  });

  return (request, response, next) => {
    if (!request.path.toLowerCase().endsWith(".pdf")) {
      response.status(404).send("E-book não encontrado.");
      return;
    }

    staticPdfFiles(request, response, next);
  };
}

function registerPackagedEbookFiles(app: express.Express, appPrefix: string) {
  const filesMiddleware = createPackagedEbookFilesMiddleware();
  app.use(PACKAGED_EBOOK_FILE_ROUTE, filesMiddleware);
  if (appPrefix) app.use(`${appPrefix}${PACKAGED_EBOOK_FILE_ROUTE}`, filesMiddleware);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const appPrefix = (process.env.VITE_DEV_PREFIX ?? "").replace(/\/+$/, "");
  const trpcPaths = Array.from(new Set(["/api/trpc", appPrefix ? `${appPrefix}/api/trpc` : null].filter((path): path is string => Boolean(path))));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerPackagedEbookFiles(app, appPrefix);
  registerStorageProxy(app);
  registerAffiliateLinkTracking(app);
  registerPublicToastConfig(app, appPrefix);
  registerPublicSalesCopyConfig(app, appPrefix);
  registerDeployStatus(app, appPrefix);
  registerAdminManualDeploy(app, appPrefix);
  registerAdminMemberManagement(app, appPrefix);
  registerAdminContentManagement(app, appPrefix);
  registerAdminRelationshipMaintenance(app, appPrefix);
  registerAdminCommercialOperations(app, appPrefix);
  for (const trpcPath of trpcPaths) {
    app.use(
      trpcPath,
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
  }
  registerCampaignRedirectRoutes(app);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
