import { useEffect } from "react";
import { useLocation } from "wouter";

const redirects: Record<string, string> = {
  "/membros/campanhas": "/membros/operacao/campanhas",
  "/membros/historico": "/membros/operacao/trafego",
  "/membros/top-visitas": "/membros/operacao/trafego",
  "/membros/convites": "/membros/operacao/contatos",
  "/membros/emails-site": "/membros/operacao/contatos",
  "/membros/emails-interessados": "/membros/operacao/contatos",
  "/membros/emails-whatsapp": "/membros/operacao/contatos",
  "/membros/automacoes": "/membros/operacao/contatos",
  "/membros/patrocinador": "/membros/rede",
  "/membros/pontos-niveis": "/membros/pontos",
  "/membros/ranking": "/membros/pontos",
  "/membros/mais-lucrativos": "/membros/pontos",
  "/membros/blog": "/membros/materiais",
  "/membros/artigos": "/membros/materiais",
  "/membros/bonus": "/membros/materiais",
  "/membros/produtos": "/membros",
};

export default function MemberLegacyRedirect() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    setLocation(redirects[location.split("?")[0]] ?? "/membros");
  }, [location, setLocation]);
  return null;
}
