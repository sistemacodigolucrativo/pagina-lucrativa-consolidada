import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MemberOffice from "./pages/MemberOffice";
import MemberOperations from "./pages/MemberOperations";
import AdminOffice from "./pages/AdminOffice";
import AdminOperations from "./pages/AdminOperations";
import ApplicationConfirmation from "./pages/ApplicationConfirmation";
import PersonalizeAccess from "./pages/PersonalizeAccess";
import DemoLogin from "./pages/DemoLogin";
function AppRoutes() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/pedido/confirmacao" component={ApplicationConfirmation} />
    <Route path="/personalizar" component={PersonalizeAccess} />
    <Route path="/acesso" component={DemoLogin} />
    <Route path="/membros/operacao" component={MemberOperations} />
    <Route path="/membros" component={MemberOffice} />
    <Route path="/membros/:section" component={MemberOffice} />
    <Route path="/admin/operacao" component={AdminOperations} />
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
