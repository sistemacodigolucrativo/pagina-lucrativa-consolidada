import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MemberOffice from "./pages/MemberOffice";
import MemberOperations from "./pages/MemberOperations";
import EbookReader from "./pages/EbookReader";
import AdminEbooks from "./pages/AdminEbooks";
import MemberProducts from "./pages/MemberProducts";
import MemberPublications from "./pages/MemberPublications";
import MemberEarnings from "./pages/MemberEarnings";
import MemberPerformance from "./pages/MemberPerformance";
import MemberCourses from "./pages/MemberCourses";
import AdminCourses from "./pages/AdminCourses";
import AdminTransactions from "./pages/AdminTransactions";
import AdminPerformance from "./pages/AdminPerformance";
import AdminProducts from "./pages/AdminProducts";
import AdminPublications from "./pages/AdminPublications";
import AdminOffice from "./pages/AdminOffice";
import AdminOperations from "./pages/AdminOperations";
import ApplicationConfirmation from "./pages/ApplicationConfirmation";
import ApplicationTracking from "./pages/ApplicationTracking";
import AdminApplications from "./pages/AdminApplications";
import MemberCommunications from "./pages/MemberCommunications";
import AdminCommunications from "./pages/AdminCommunications";
import MemberReferrals from "./pages/MemberReferrals";
import AdminReferrals from "./pages/AdminReferrals";
import MemberPersonalization from "./pages/MemberPersonalization";
import MemberTraffic from "./pages/MemberTraffic";
import MemberCredentials from "./pages/MemberCredentials";
import PersonalizeAccess from "./pages/PersonalizeAccess";
import DemoLogin from "./pages/DemoLogin";
function AppRoutes() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/pedido/confirmacao" component={ApplicationConfirmation} />
    <Route path="/pedido/acompanhar" component={ApplicationTracking} />
    <Route path="/personalizar" component={PersonalizeAccess} />
    <Route path="/acesso" component={DemoLogin} />
    <Route path="/membros/operacao" component={MemberOperations} />
    <Route path="/membros/ebooks" component={EbookReader} />
    <Route path="/membros/produtos" component={MemberProducts} />
    <Route path="/membros/rede" component={MemberReferrals} />
    <Route path="/membros/patrocinador" component={MemberReferrals} />
    <Route path="/membros/blog" component={MemberPublications} />
    <Route path="/membros/classificados" component={MemberPublications} />
    <Route path="/membros/materiais" component={MemberPublications} />
    <Route path="/membros/bonus" component={MemberPublications} />
    <Route path="/membros/artigos" component={MemberPublications} />
    <Route path="/membros/perguntas-frequentes" component={MemberPublications} />
    <Route path="/membros/emails-site" component={MemberCommunications} />
    <Route path="/membros/emails-interessados" component={MemberCommunications} />
    <Route path="/membros/emails-whatsapp" component={MemberCommunications} />
    <Route path="/membros/automacoes" component={MemberCommunications} />
    <Route path="/membros/mensagem-especial" component={MemberPersonalization} />
    <Route path="/membros/meus-dados" component={MemberOperations} />
    <Route path="/membros/configuracoes" component={MemberOperations} />
    <Route path="/membros/como-divulgar" component={MemberOperations} />
    <Route path="/membros/campanhas" component={MemberOperations} />
    <Route path="/membros/convites" component={MemberOperations} />
    <Route path="/membros/cartao-certificado" component={MemberCredentials} />
    <Route path="/membros/historico" component={MemberTraffic} />
    <Route path="/membros/top-visitas" component={MemberTraffic} />
    <Route path="/membros/ganhos" component={MemberEarnings} />
    <Route path="/membros/pontos" component={MemberPerformance} />
    <Route path="/membros/pontos-niveis" component={MemberPerformance} />
    <Route path="/membros/ranking" component={MemberPerformance} />
    <Route path="/membros/mais-lucrativos" component={MemberPerformance} />
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
    <Route path="/membros/filmes" component={MemberCourses} />
    <Route path="/membros" component={MemberOffice} />
    <Route path="/membros/:section" component={MemberOffice} />
    <Route path="/admin/operacao" component={AdminOperations} />
    <Route path="/admin/ebooks" component={AdminEbooks} />
    <Route path="/admin/produtos" component={AdminProducts} />
    <Route path="/admin/membros" component={AdminReferrals} />
    <Route path="/admin/publicacoes" component={AdminPublications} />
    <Route path="/admin/pedidos" component={AdminApplications} />
    <Route path="/admin/comunicacoes" component={AdminCommunications} />
    <Route path="/admin/financeiro" component={AdminTransactions} />
    <Route path="/admin/pontos" component={AdminPerformance} />
    <Route path="/admin/academia" component={AdminCourses} />
    <Route path="/admin" component={AdminOffice} />
    <Route path="/admin/:section" component={AdminOffice} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}
function App() {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  const base = pathname === "/paginalucrativa" || pathname.startsWith("/paginalucrativa/") ? "/paginalucrativa" : "";
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><WouterRouter base={base}><AppRoutes /></WouterRouter></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
export default App;
