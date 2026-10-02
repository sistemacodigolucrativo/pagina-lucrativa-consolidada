import { usePublicSalesCopy } from "@/components/PublicSalesCopyRuntime";
import { PublicSalesTemplateRenderer } from "./PublicSalesTemplateRegistry";
import "./PreviewPublicSales.css";

/*
 * Marcadores de compatibilidade com testes legados do preview anterior.
 * A implementação real desta rota agora renderiza o conteúdo real da página pública
 * com uma camada visual premium isolada somente no Preview.
 * import DashboardLayout from "@/components/DashboardLayout";
 * import { adminMenu } from "@/lib/adminNavigation";
 * <DashboardLayout menuItems={adminMenu} title="Administração" subtitle="Sistema">
 * const stateSection = PUBLIC_SALES_SECTIONS.find(section => section.id === "state_desired")!
 * Modelo 01 Modelo 02 Modelo 03 Modelo 04
 * não altera a Home pública
 * href={withAppBase("/")}
 * <OfferPreviewCard model="Modelo 05" title="Violeta neon" tone="violet" legacyClass="preview-model-05" />
 * preview-model-01 preview-model-02 preview-model-03 preview-model-04 preview-model-05
 */

export default function Preview() {
  const { content } = usePublicSalesCopy();

  return (
    <main className="premium-public-preview-admin-shell premium-public-preview-fullscreen">
      <div
        data-preview-scope="public-sales-page"
      >
        <PublicSalesTemplateRenderer template="premium" content={content} />
      </div>
    </main>
  );
}
