import { usePublicSalesCopy } from "@/components/PublicSalesCopyRuntime";
import Home from "./Home";
import "./PreviewPublicSales.css";

export default function PublicHome() {
  const { pageTemplate, ready } = usePublicSalesCopy();

  if (!ready) {
    return (
      <div
        className="min-h-screen bg-black"
        aria-label="Carregando página pública"
      />
    );
  }

  if (pageTemplate === "premium") {
    return (
      <div
        className="public-sales-premium-preview real-public-sales-preview"
        data-public-template="premium"
      >
        <Home />
      </div>
    );
  }

  return <Home />;
}
