import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MemberOffice from "./pages/MemberOffice";
import MemberOperationCenter from "./pages/MemberOperationCenter";
import EbookReader from "./pages/EbookReader";
import AdminEbooks from "./pages/AdminEbooks";
import AdminAcademy from "./pages/AdminAcademy";
import AdminMemberEdit from "./pages/AdminMemberEdit";
import AdminMemberDeletionQueue from "./pages/AdminMemberDeletionQueue";
import AdminManualDeploy from "./pages/AdminManualDeploy";
import MemberPublications from "./pages/MemberPublications";
import MemberEarnings from "./pages/MemberEarnings";
import MemberReceiving from "./pages/MemberReceiving";
import MemberAffiliateOrders from "./pages/MemberAffiliateOrders";
import MemberPerformance from "./pages/MemberPerformance";
import MemberCourses from "./pages/MemberCourses";
import AdminPublications from "@/pages/AdminPublications";
import AdminSalesSectionsPage from "@/pages/AdminSalesSectionsPage";
import Preview from "@/pages/Preview";
import AdminOffice from "./pages/AdminOffice";
import AdminOperations from "./pages/AdminOperations";
import AdminAudit from "./pages/AdminAudit";
import AdminFutureImplementations from "./pages/AdminFutureImplementations";
import AdminToast from "./pages/AdminToast";
import AdminSupport from "./pages/AdminSupport";
import ApplicationConfirmation from "./pages/ApplicationConfirmation";
import ApplicationPayment from "./pages/ApplicationPayment";
import ApplicationTracking from "./pages/ApplicationTracking";
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
import { CommercialRulesPage, ContactPage, FaqPage, InstitutionalPage, PrivacyPage, TermsPage } from "./pages/PublicInfoPage";
import { DEV_PREFIX } from "./lib/devPath";
import AdminDeployStatus from "./components/AdminDeployStatus";

function AppRoutes() {
  return <><AdminDeployStatus /><Switch>
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
    <Route path="/perguntas-frequentes" component={FaqPage} />
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
    <Route path="/admin/ebooks/novo" component={AdminEbooks} />
    <Route path="/admin/ebooks/:ebookId/editar" component={AdminEbooks} />
    <Route path="/admin/ebooks" component={AdminEbooks} />
    <Route path="/admin/membros/exclusoes" component={AdminMemberDeletionQueue} />
    <Route path="/admin/membros/:memberId/editar" component={AdminMemberEdit} />
    <Route path="/admin/membros" component={AdminReferrals} />
    <Route path="/admin/deploy" component={AdminManualDeploy} />
    <Route path="/admin/material-divulgacao" component={AdminPublications} />
    <Route path="/admin/biblioteca-recursos" component={AdminPublications} />
    <Route path="/admin/perguntas-frequentes" component={AdminPublications} />
    <Route path="/admin/publicacoes" component={AdminPublications} />
    <Route path="/admin/imagens" component={AdminSalesSectionsPage} />
    <Route path="/preview" component={Preview} />
    <Route path="/admin/futuras-implementacoes" component={AdminFutureImplementations} />
    <Route path="/admin/toast" component={AdminToast} />
    <Route path="/admin/divulgacao" component={AdminOperations} />
    <Route path="/admin/suporte" component={AdminSupport} />
    <Route path="/admin/auditoria" component={AdminAudit} />
    <Route path="/admin/pedidos" component={AdminOperations} />
    <Route path="/admin/financeiro" component={AdminOperations} />
    <Route path="/admin/relatos/em-analise" component={AdminTestimonials} />
    <Route path="/admin/relatos/aprovados" component={AdminTestimonials} />
    <Route path="/admin/relatos/necessita-ajuste" component={AdminTestimonials} />
    <Route path="/admin/relatos/arquivados" component={AdminTestimonials} />
    <Route path="/admin/relatos" component={AdminTestimonials} />
    <Route path="/admin/academia" component={AdminAcademy} />
    <Route path="/admin" component={AdminOffice} />
    <Route path="/admin/:section" component={AdminOffice} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></>;
}
function App() {
  const base = DEV_PREFIX;
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><WouterRouter base={base}><AppRoutes /></WouterRouter></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
export default App;
