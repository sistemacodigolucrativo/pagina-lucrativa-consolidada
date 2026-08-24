import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MemberOffice from "./pages/MemberOffice";
import MemberOperationCenter from "./pages/MemberOperationCenter";
import EbookReader from "./pages/EbookReader";
import AdminEbooks from "./pages/AdminEbooks";
import MemberPublications from "./pages/MemberPublications";
import MemberEarnings from "./pages/MemberEarnings";
import MemberReceiving from "./pages/MemberReceiving";
import MemberAffiliateOrders from "./pages/MemberAffiliateOrders";
import MemberPerformance from "./pages/MemberPerformance";
import MemberCourses from "./pages/MemberCourses";
import AdminCourses from "./pages/AdminCourses";
import AdminTransactions from "./pages/AdminTransactions";
import AdminPerformance from "./pages/AdminPerformance";
import AdminPublications from "@/pages/AdminPublications";
import AdminSalesImages from "@/pages/AdminSalesImages";
import Preview from "@/pages/Preview";
import AdminOffice from "./pages/AdminOffice";
import AdminOperations from "./pages/AdminOperations";
import ApplicationConfirmation from "./pages/ApplicationConfirmation";
import ApplicationPayment from "./pages/ApplicationPayment";
import ApplicationTracking from "./pages/ApplicationTracking";
import AdminApplications from "./pages/AdminApplications";
import AdminCommunications from "./pages/AdminCommunications";
import MemberReferrals from "./pages/MemberReferrals";
import AdminReferrals from "./pages/AdminReferrals";
import MemberCredentials from "./pages/MemberCredentials";
import MemberTestimonial from "./pages/MemberTestimonial";
import AdminTestimonials from "./pages/AdminTestimonials";
import DemoLogin from "./pages/DemoLogin";
import ApplicationPersonalization from "./pages/ApplicationPersonalization";
import MemberProfile from "./pages/MemberProfile";
import MemberAccount from "./pages/MemberAccount";
import MemberGettingStarted from "./pages/MemberGettingStarted";
import MemberSupport from "./pages/MemberSupport";
import MemberLegacyRedirect from "./pages/MemberLegacyRedirect";
import { CommercialRulesPage, ContactPage, InstitutionalPage, PrivacyPage, TermsPage } from "./pages/PublicInfoPage";
import { DEV_PREFIX } from "./lib/devPath";

function AppRoutes() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/pedido/confirmacao" component={ApplicationConfirmation} />
    <Route path="/pedido/:trackingCode/pagamento/instrucoes" component={ApplicationPayment} />
    <Route path="/pedido/:trackingCode/pagamento" component={ApplicationPayment} />
    <Route path="/pedido/acompanhar" component={ApplicationTracking} />
    <Route path="/personalizar" component={ApplicationPersonalization} />
    <Route path="/acesso" component={DemoLogin} />
    <Route path="/institucional" component={InstitutionalPage} />
    <Route path="/termos-de-uso" component={TermsPage} />
    <Route path="/politica-de-privacidade" component={PrivacyPage} />
    <Route path="/regras-comerciais" component={CommercialRulesPage} />
    <Route path="/contato" component={ContactPage} />
    <Route path="/membros/operacao" component={MemberOperationCenter} />
    <Route path="/membros/operacao/campanhas" component={MemberOperationCenter} />
    <Route path="/membros/operacao/trafego" component={MemberOperationCenter} />
    <Route path="/membros/operacao/conversoes" component={MemberOperationCenter} />
    <Route path="/membros/operacao/contatos" component={MemberOperationCenter} />
    <Route path="/membros/operacao/historico" component={MemberOperationCenter} />
    <Route path="/membros/operacao/:campaignId" component={MemberOperationCenter} />
    <Route path="/membros/ebooks" component={EbookReader} />
    <Route path="/membros/produtos" component={MemberLegacyRedirect} />
    <Route path="/membros/rede" component={MemberReferrals} />


    <Route path="/membros/classificados" component={MemberPublications} />
    <Route path="/membros/materiais" component={MemberPublications} />

    <Route path="/membros/artigos" component={MemberPublications} />
    <Route path="/membros/perguntas-frequentes" component={MemberPublications} />




    <Route path="/membros/fazer-depoimento" component={MemberTestimonial} />
    <Route path="/membros/meus-dados" component={MemberAccount} />
    <Route path="/membros/configuracoes" component={MemberProfile} />
    <Route path="/membros/como-divulgar" component={MemberGettingStarted} />
    <Route path="/membros/fale-conosco" component={MemberSupport} />
    <Route path="/membros/campanhas" component={MemberLegacyRedirect} />
    <Route path="/membros/convites" component={MemberLegacyRedirect} />
    <Route path="/membros/historico" component={MemberLegacyRedirect} />
    <Route path="/membros/top-visitas" component={MemberLegacyRedirect} />
    <Route path="/membros/emails-site" component={MemberLegacyRedirect} />
    <Route path="/membros/emails-interessados" component={MemberLegacyRedirect} />
    <Route path="/membros/emails-whatsapp" component={MemberLegacyRedirect} />
    <Route path="/membros/automacoes" component={MemberLegacyRedirect} />
    <Route path="/membros/patrocinador" component={MemberLegacyRedirect} />
    <Route path="/membros/pontos-niveis" component={MemberLegacyRedirect} />
    <Route path="/membros/ranking" component={MemberLegacyRedirect} />
    <Route path="/membros/mais-lucrativos" component={MemberLegacyRedirect} />
    <Route path="/membros/blog" component={MemberLegacyRedirect} />
    <Route path="/membros/bonus" component={MemberLegacyRedirect} />




    <Route path="/membros/cartao-certificado" component={MemberCredentials} />


    <Route path="/membros/ganhos" component={MemberEarnings} />
    <Route path="/membros/recebimentos" component={MemberReceiving} />
    <Route path="/membros/meus-pedidos" component={MemberAffiliateOrders} />
    <Route path="/membros/pontos" component={MemberPerformance} />



    <Route path="/membros/academia" component={MemberCourses} />
    <Route path="/membros/curso-google-ads" component={MemberCourses} />
    <Route path="/membros/curso-facebook-ads" component={MemberCourses} />
    <Route path="/membros/curso-posts-facebook" component={MemberCourses} />
    <Route path="/membros/curso-canva" component={MemberCourses} />
    <Route path="/membros/curso-negocio" component={MemberCourses} />
    <Route path="/membros/curso-autonomo" component={MemberCourses} />
    <Route path="/membros/curso-recepcionista" component={MemberCourses} />
    <Route path="/membros/curso-ebook" component={MemberCourses} />
    <Route path="/membros/curso-importacao" component={MemberCourses} />
    <Route path="/membros/curso-excel" component={MemberCourses} />
    <Route path="/membros/curso-tiktok-ads" component={MemberCourses} />
    <Route path="/membros/curso-captura" component={MemberCourses} />
    <Route path="/membros/curso-logotipo" component={MemberCourses} />
    <Route path="/membros/curso-capas-videos" component={MemberCourses} />
    <Route path="/membros/curso-capas-3d" component={MemberCourses} />
    <Route path="/membros/curso-dominio-estrategico" component={MemberCourses} />
    <Route path="/membros/filmes" component={MemberCourses} />
    <Route path="/membros/curso/:courseKey" component={MemberCourses} />
    <Route path="/membros" component={MemberOffice} />
    <Route path="/membros/:section" component={MemberOffice} />
    <Route path="/admin/operacao" component={AdminOperations} />
    <Route path="/admin/ebooks" component={AdminEbooks} />
    <Route path="/admin/membros" component={AdminReferrals} />
    <Route path="/admin/publicacoes" component={AdminPublications} />
    <Route path="/admin/imagens" component={AdminSalesImages} />
    <Route path="/preview" component={Preview} />
    <Route path="/admin/pedidos" component={AdminApplications} />
    <Route path="/admin/comunicacoes" component={AdminCommunications} />
    <Route path="/admin/financeiro" component={AdminTransactions} />
    <Route path="/admin/pontos" component={AdminPerformance} />
    <Route path="/admin/relatos" component={AdminTestimonials} />
    <Route path="/admin/academia" component={AdminCourses} />
    <Route path="/admin" component={AdminOffice} />
    <Route path="/admin/:section" component={AdminOffice} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}
function App() {
  const base = DEV_PREFIX;
  const platformSettings = trpc.public.platformSettings.useQuery(undefined, { staleTime: 30_000 });
  useEffect(() => {
    if (!platformSettings.data?.hideExternalPreviewNotice) return;
    const message = "This page is not live and cannot be shared directly. Please publish to get a public link.";
    const canHideElement = (element: HTMLElement) => {
      if (element === document.body || element === document.documentElement || element.id === "root") return false;
      if (element.querySelector("#root, main, [role='main'], .office-page, .access-page, .sales-page")) return false;
      const text = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (!text.includes(message) || text.length > message.length + 80) return false;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (style.position === "fixed" || style.position === "sticky" || rect.height <= 140) && rect.width > 120 && rect.height > 0;
    };
    const hidePreviewNotice = () => {
      for (const element of Array.from(document.body.querySelectorAll<HTMLElement>("body *"))) {
        if (canHideElement(element)) element.style.setProperty("display", "none", "important");
      }
    };
    hidePreviewNotice();
    const observer = new MutationObserver(hidePreviewNotice);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(hidePreviewNotice, 1000);
    return () => { observer.disconnect(); window.clearInterval(interval); };
  }, [platformSettings.data?.hideExternalPreviewNotice]);
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><WouterRouter base={base}><AppRoutes /></WouterRouter></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
export default App;
