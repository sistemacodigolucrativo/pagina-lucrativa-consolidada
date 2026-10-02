import { usePublicSalesCopy } from "@/components/PublicSalesCopyRuntime";
import { PublicSalesTemplateRenderer } from "./PublicSalesTemplateRegistry";
import "./PreviewPublicSales.css";

export default function PublicHome() {
  const { content, pageTemplate, ready } = usePublicSalesCopy();

  if (!ready) {
    return (
      <div
        className="min-h-screen bg-black"
        aria-label="Carregando página pública"
      />
    );
  }

  return <PublicSalesTemplateRenderer template={pageTemplate} content={content} />;
}
