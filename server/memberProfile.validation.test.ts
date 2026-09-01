import { describe, expect, it } from "vitest";
import { isSupportedProfilePhotoBuffer } from "./db";
import { appRouter, profileInput, profilePhotoInput } from "./routers";

describe("Editar perfil — contrato completo", () => {
  const fullProfile = {
    slug: "  pessoa-exemplo ",
    bio: "  Uma apresentação completa. ",
    whatsapp: "11987654321",
    websiteUrl: "https://example.com",
    facebookUrl: "https://facebook.com/pessoa",
    twitterUrl: "https://x.com/pessoa",
    linkedinUrl: "https://linkedin.com/in/pessoa",
    youtubeUrl: "https://youtube.com/@pessoa",
    skype: "pessoa.skype",
    address: "Rua das Flores",
    addressNumber: "123",
    addressComplement: "Sala 4",
    postalCode: "01001-000",
    district: "Centro",
    city: "São Paulo",
    state: "SP",
  };

  it("aceita todos os campos antigos e normaliza os valores básicos", () => {
    expect(profileInput.parse(fullProfile)).toMatchObject({
      slug: "pessoa-exemplo",
      bio: "Uma apresentação completa.",
      facebookUrl: "https://facebook.com/pessoa",
      address: "Rua das Flores",
      state: "SP",
    });
  });

  it("rejeita slug sem letra ou número e links que não usam HTTP/HTTPS", () => {
    expect(() => profileInput.parse({ ...fullProfile, slug: "---" })).toThrow();
    expect(() => profileInput.parse({ ...fullProfile, facebookUrl: "javascript:alert(1)" })).toThrow();
    expect(() => profileInput.parse({ ...fullProfile, youtubeUrl: "ftp://example.com/video" })).toThrow();
  });

  it("permite limpar campos opcionais sem transformar nulo em texto", () => {
    const result = profileInput.parse({ ...fullProfile, bio: null, facebookUrl: null, address: null });
    expect(result.bio).toBeNull();
    expect(result.facebookUrl).toBeNull();
    expect(result.address).toBeNull();
  });
});

describe("Editar perfil — foto", () => {
  it("aceita somente data URLs de imagem nos formatos legados", () => {
    expect(profilePhotoInput.parse({ dataUrl: "data:image/png;base64,aGVsbG8=", contentType: "image/png" })).toEqual({
      dataUrl: "data:image/png;base64,aGVsbG8=",
      contentType: "image/png",
    });
  });

  it("rejeita conteúdo que não seja imagem suportada", () => {
    expect(() => profilePhotoInput.parse({ dataUrl: "data:text/plain;base64,aGVsbG8=", contentType: "image/png" })).toThrow();
    expect(() => profilePhotoInput.parse({ dataUrl: "data:image/png;base64,aGVsbG8=", contentType: "image/svg+xml" as "image/png" })).toThrow();
  });

  it("rejeita payload base64 que não contém assinatura real de imagem", () => {
    expect(isSupportedProfilePhotoBuffer(Buffer.from("hello"), "image/jpeg")).toBe(false);
    expect(isSupportedProfilePhotoBuffer(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")).toBe(true);
    expect(isSupportedProfilePhotoBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe(true);
    expect(isSupportedProfilePhotoBuffer(Buffer.from("GIF89a"), "image/gif")).toBe(true);
  });
});

describe("Editar perfil — proteção", () => {
  it("não permite consultar o perfil sem sessão autenticada", async () => {
    const caller = appRouter.createCaller({ user: null, authSource: null, req: {} as any, res: {} as any });
    await expect(caller.member.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
