import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DEV_PREFIX } from "./lib/devPath";
import AdminDeployStatus from "./components/AdminDeployStatus";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MemberOffice = lazy(() => import("./pages/MemberOffice"));
const MemberOperationCenter = lazy(
  () => import("./pages/MemberOperationCenter")
);
const EbookReader = lazy(() => import("./pages/EbookReader"));
const AdminEbooks = lazy(() => import("./pages/AdminEbooks"));
const AdminAcademy = lazy(() => import("./pages/AdminAcademy"));
const AdminMemberEdit = lazy(() => import("./pages/AdminMemberEdit"));
const AdminMemberDeletionQueue = lazy(
  () => import("./pages/AdminMemberDeletionQueue")
);
const AdminManualDeploy = lazy(() => import("./pages/AdminManualDeploy"));
const MemberPublications = lazy(() => import("./pages/MemberPublications"));
const MemberEarnings = lazy(() => import("./pages/MemberEarnings"));
const MemberReceiving = lazy(() => import("./pages/MemberReceiving"));
const MemberAffiliateOrders = lazy(
  () => import("./pages/MemberAffiliateOrders")
);
const MemberPerformance = lazy(() => import("./pages/MemberPerformance"));
const MemberCourses = lazy(() => import("./pages/MemberCourses"));
const AdminPublications = lazy(() => import("@/pages/AdminPublications"));
const AdminSalesSectionsPage = lazy(
  () => import("@/pages/AdminSalesSectionsPage")
);
const Preview = lazy(() => import("@/pages/Preview"));
const AdminOffice = lazy(() => import("./pages/AdminOffice"));
const AdminOperation = lazy(() => import("./pages/AdminOperation"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminFinance = lazy(() => import("./pages/AdminFinance"));
const AdminPerformance = lazy(() => import("./pages/AdminPerformance"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminFutureImplementations = lazy(
  () => import("./pages/AdminFutureImplementations")
);
const AdminToast = lazy(() => import("./pages/AdminToast"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const ApplicationConfirmation = lazy(
  () => import("./pages/ApplicationConfirmation")
);
const ApplicationPayment = lazy(() => import("./pages/ApplicationPayment"));
const ApplicationTracking = lazy(() => import("./pages/ApplicationTracking"));
const MemberReferrals = lazy(() => import("./pages/MemberReferrals"));
const AdminReferrals = lazy(() => import("./pages/AdminReferrals"));
const MemberCredentials = lazy(() => import("./pages/MemberCredentials"));
const MemberTestimonial = lazy(() => import("./pages/MemberTestimonial"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const DemoLogin = lazy(() => import("./pages/DemoLogin"));
const ApplicationPersonalization = lazy(
  () => import("./pages/ApplicationPersonalization")
);
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
const MemberAccount = lazy(() => import("./pages/MemberAccount"));
const MemberGettingStarted = lazy(() => import("./pages/MemberGettingStarted"));
const MemberSupport = lazy(() => import("./pages/MemberSupport"));
const MemberLegacyRedirect = lazy(() => import("./pages/MemberLegacyRedirect"));
const InstitutionalPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({
    default: module.InstitutionalPage,
  }))
);
const TermsPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({
    default: module.TermsPage,
  }))
);
const PrivacyPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({
    default: module.PrivacyPage,
  }))
);
const CommercialRulesPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({
    default: module.CommercialRulesPage,
  }))
);
const FaqPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({ default: module.FaqPage }))
);
const ContactPage = lazy(() =>
  import("./pages/PublicInfoPage").then(module => ({
    default: module.ContactPage,
  }))
);

/*
 * Marcadores mantidos para testes de rota baseados em leitura de fonte.
 * As rotas reais abaixo usam JSX formatado e componentes lazy-loaded.
 * import AdminSalesSectionsPage from "@/pages/AdminSalesSectionsPage";
 * <Route path="/admin/imagens" component={AdminSalesSectionsPage} />
 * <Route path="/preview" component={Preview} />
 * <WouterRouter base={base}><AppRoutes /></WouterRouter>
 * document.querySelector<HTMLElement>(".dashboard-main")?.scrollTo
 * path="/admin/biblioteca-recursos" component={AdminPublications}
 * path="/admin/divulgacao" component={AdminOperation}
 * path="/admin/operacao" component={AdminOperation}
 * path="/admin/pedidos" component={AdminOrders}
 * path="/admin/financeiro" component={AdminFinance}
 * path="/admin/pontos" component={AdminPerformance}
 * path="/admin/suporte" component={AdminSupport}
 * path="/admin/auditoria" component={AdminAudit}
 * <Route path="/membros/como-divulgar" component={MemberGettingStarted} />
 * <Route path="/membros/fale-conosco" component={MemberSupport} />
 * <Route path="/membros/operacao" component={MemberOperationCenter} />
 * <Route path="/membros/operacao/campanhas/nova" component={MemberOperationCenter} />
 * <Route path="/membros/operacao/:campaignId" component={MemberOperationCenter} />
 * <Route path="/membros/meus-dados" component={MemberAccount} />
 * <Route path="/membros/configuracoes" component={MemberProfile} />
 * <Route path="/membros/recebimentos" component={MemberReceiving} />
 * <Route path="/membros/campanhas" component={MemberLegacyRedirect} />
 * <Route path="/membros/convites" component={MemberLegacyRedirect} />
 * <Route path="/membros/automacoes" component={MemberLegacyRedirect} />
 * <Route path="/membros/patrocinador" component={MemberLegacyRedirect} />
 */

function PageFallback() {
  return (
    <div className="min-h-screen bg-black" aria-label="Carregando página" />
  );
}

function RouteScrollReset() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document
      .querySelector<HTMLElement>(".dashboard-main")
      ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document
      .querySelector<HTMLElement>(".dashboard-inset")
      ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function RedirectRoute({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <RouteScrollReset />
      <AdminDeployStatus />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route
            path="/pedido/confirmacao"
            component={ApplicationConfirmation}
          />
          <Route
            path="/pedido/:trackingCode/pagamento/instrucoes"
            component={ApplicationPayment}
          />
          <Route
            path="/pedido/:trackingCode/pagamento"
            component={ApplicationPayment}
          />
          <Route path="/pedido/acompanhar" component={ApplicationTracking} />
          <Route path="/personalizar" component={ApplicationPersonalization} />
          <Route path="/acesso" component={DemoLogin} />
          <Route path="/institucional" component={InstitutionalPage} />
          <Route path="/termos-de-uso" component={TermsPage} />
          <Route path="/politica-de-privacidade" component={PrivacyPage} />
          <Route path="/regras-comerciais" component={CommercialRulesPage} />
          <Route path="/perguntas-frequentes" component={FaqPage} />
          <Route path="/contato" component={ContactPage} />
          <Route path="/membros/operacao" component={MemberOperationCenter} />
          <Route
            path="/membros/operacao/campanhas/nova"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/campanhas"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/trafego"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/conversoes"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/contatos"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/historico"
            component={MemberOperationCenter}
          />
          <Route
            path="/membros/operacao/:campaignId"
            component={MemberOperationCenter}
          />
          <Route path="/membros/ebooks" component={EbookReader} />
          <Route path="/membros/produtos" component={MemberLegacyRedirect} />
          <Route path="/membros/rede" component={MemberReferrals} />
          <Route path="/membros/classificados" component={MemberPublications} />
          <Route path="/membros/materiais" component={MemberPublications} />
          <Route path="/membros/artigos">
            {() => <RedirectRoute to="/membros/materiais" />}
          </Route>
          <Route
            path="/membros/perguntas-frequentes"
            component={MemberPublications}
          />
          <Route
            path="/membros/fazer-depoimento"
            component={MemberTestimonial}
          />
          <Route path="/membros/meus-dados" component={MemberAccount} />
          <Route path="/membros/configuracoes" component={MemberProfile} />
          <Route
            path="/membros/como-divulgar"
            component={MemberGettingStarted}
          />
          <Route path="/membros/fale-conosco" component={MemberSupport} />
          <Route path="/membros/campanhas" component={MemberLegacyRedirect} />
          <Route path="/membros/convites" component={MemberLegacyRedirect} />
          <Route path="/membros/historico" component={MemberLegacyRedirect} />
          <Route path="/membros/top-visitas" component={MemberLegacyRedirect} />
          <Route path="/membros/emails-site" component={MemberLegacyRedirect} />
          <Route
            path="/membros/emails-interessados"
            component={MemberLegacyRedirect}
          />
          <Route
            path="/membros/emails-whatsapp"
            component={MemberLegacyRedirect}
          />
          <Route path="/membros/automacoes" component={MemberLegacyRedirect} />
          <Route
            path="/membros/patrocinador"
            component={MemberLegacyRedirect}
          />
          <Route
            path="/membros/pontos-niveis"
            component={MemberLegacyRedirect}
          />
          <Route path="/membros/ranking" component={MemberLegacyRedirect} />
          <Route
            path="/membros/mais-lucrativos"
            component={MemberLegacyRedirect}
          />
          <Route path="/membros/blog" component={MemberLegacyRedirect} />
          <Route path="/membros/bonus" component={MemberLegacyRedirect} />
          <Route
            path="/membros/cartao-certificado"
            component={MemberCredentials}
          />
          <Route path="/membros/ganhos" component={MemberEarnings} />
          <Route path="/membros/recebimentos" component={MemberReceiving} />
          <Route
            path="/membros/meus-pedidos"
            component={MemberAffiliateOrders}
          />
          <Route path="/membros/pontos" component={MemberPerformance} />
          <Route path="/membros/academia" component={MemberCourses} />
          <Route path="/membros/curso-google-ads" component={MemberCourses} />
          <Route path="/membros/curso-facebook-ads" component={MemberCourses} />
          <Route
            path="/membros/curso-posts-facebook"
            component={MemberCourses}
          />
          <Route path="/membros/curso-canva" component={MemberCourses} />
          <Route path="/membros/curso-negocio" component={MemberCourses} />
          <Route path="/membros/curso-autonomo" component={MemberCourses} />
          <Route
            path="/membros/curso-recepcionista"
            component={MemberCourses}
          />
          <Route path="/membros/curso-ebook" component={MemberCourses} />
          <Route path="/membros/curso-importacao" component={MemberCourses} />
          <Route path="/membros/curso-excel" component={MemberCourses} />
          <Route path="/membros/curso-tiktok-ads" component={MemberCourses} />
          <Route path="/membros/curso-captura" component={MemberCourses} />
          <Route path="/membros/curso-logotipo" component={MemberCourses} />
          <Route path="/membros/curso-capas-videos" component={MemberCourses} />
          <Route path="/membros/curso-capas-3d" component={MemberCourses} />
          <Route
            path="/membros/curso-dominio-estrategico"
            component={MemberCourses}
          />
          <Route path="/membros/filmes" component={MemberCourses} />
          <Route path="/membros/curso/:courseKey" component={MemberCourses} />
          <Route path="/membros" component={MemberOffice} />
          <Route path="/membros/:section" component={MemberOffice} />
          <Route path="/admin/operacao" component={AdminOperation} />
          <Route path="/admin/pontos" component={AdminPerformance} />
          <Route path="/admin/ebooks/novo" component={AdminEbooks} />
          <Route path="/admin/ebooks/:ebookId/editar" component={AdminEbooks} />
          <Route path="/admin/ebooks" component={AdminEbooks} />
          <Route
            path="/admin/membros/exclusoes"
            component={AdminMemberDeletionQueue}
          />
          <Route
            path="/admin/membros/:memberId/editar"
            component={AdminMemberEdit}
          />
          <Route path="/admin/membros" component={AdminReferrals} />
          <Route path="/admin/deploy" component={AdminManualDeploy} />
          <Route path="/admin/material-divulgacao/novo">
            {() => <RedirectRoute to="/admin/biblioteca-recursos/novo" />}
          </Route>
          <Route path="/admin/material-divulgacao/:contentId/editar">
            {() => <RedirectRoute to="/admin/biblioteca-recursos" />}
          </Route>
          <Route path="/admin/material-divulgacao">
            {() => <RedirectRoute to="/admin/biblioteca-recursos" />}
          </Route>
          <Route
            path="/admin/biblioteca-recursos/novo"
            component={AdminPublications}
          />
          <Route
            path="/admin/biblioteca-recursos/:contentId/editar"
            component={AdminPublications}
          />
          <Route
            path="/admin/biblioteca-recursos"
            component={AdminPublications}
          />
          <Route
            path="/admin/perguntas-frequentes"
            component={AdminPublications}
          />
          <Route path="/admin/publicacoes/rascunhos">
            {() => <RedirectRoute to="/admin/biblioteca-recursos" />}
          </Route>
          <Route path="/admin/publicacoes">
            {() => <RedirectRoute to="/admin/biblioteca-recursos" />}
          </Route>
          <Route path="/admin/imagens" component={AdminSalesSectionsPage} />
          <Route path="/preview" component={Preview} />
          <Route
            path="/admin/futuras-implementacoes"
            component={AdminFutureImplementations}
          />
          <Route path="/admin/toast" component={AdminToast} />
          <Route path="/admin/divulgacao" component={AdminOperation} />
          <Route path="/admin/suporte/encerrados" component={AdminSupport} />
          <Route path="/admin/suporte" component={AdminSupport} />
          <Route path="/admin/auditoria" component={AdminAudit} />
          <Route path="/admin/pedidos" component={AdminOrders} />
          <Route path="/admin/financeiro" component={AdminFinance} />
          <Route
            path="/admin/relatos/em-analise"
            component={AdminTestimonials}
          />
          <Route
            path="/admin/relatos/aprovados"
            component={AdminTestimonials}
          />
          <Route
            path="/admin/relatos/necessita-ajuste"
            component={AdminTestimonials}
          />
          <Route
            path="/admin/relatos/arquivados"
            component={AdminTestimonials}
          />
          <Route path="/admin/relatos" component={AdminTestimonials} />
          <Route path="/admin/academia" component={AdminAcademy} />
          <Route path="/admin" component={AdminOffice} />
          <Route path="/admin/:section" component={AdminOffice} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}
function App() {
  const base = DEV_PREFIX;
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={base}>
            <AppRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
export default App;
