import { describe, expect, it } from "vitest";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.env.PROJECT_ROOT || process.cwd();

const read = (relativePath: string) => readFile(path.join(root, relativePath), "utf8");

describe("remoção da supervisão global de Divulgação", () => {
  it("remove a superfície Admin sem deixar rota operacional ou tela órfã", async () => {
    const app = await read("client/src/App.tsx");
    const navigation = await read("client/src/lib/adminNavigation.ts");
    const adminOffice = await read("client/src/pages/AdminOffice.tsx");
    const legacy = await read("client/src/pages/AdminOperations.tsx");
    const router = await read("server/routers.ts");
    const db = await read("server/db.ts");

    expect(navigation).not.toContain('label: "Divulgação"');
    expect(navigation).not.toContain('path: "/admin/divulgacao"');
    expect(app).toContain('path="/admin/divulgacao" component={AdminOperations}');
    expect(app).not.toContain("AdminOutreach");
    expect(adminOffice).not.toContain("trpc.admin.contacts");
    expect(adminOffice).not.toContain("capturedContacts");
    expect(adminOffice).not.toContain("/admin/divulgacao");
    expect(legacy).toContain("Módulo administrativo removido");
    expect(legacy).toContain('setLocation("/admin")');
    expect(router).not.toContain("contacts: adminProcedure");
    expect(router).not.toContain("updateContact: adminProcedure");
    expect(db).not.toContain("export async function getAdminContacts");
    expect(db).not.toContain("export async function updateAdminContact");
    await expect(access(path.join(root, "client/src/pages/AdminOutreach.tsx"))).rejects.toThrow();
  });

  it("preserva a Central de Divulgação, consentimento, conversões e comunicações", async () => {
    const router = await read("server/routers.ts");
    const db = await read("server/db.ts");
    const memberCenter = await read("client/src/pages/MemberOperationCenter.tsx");
    const input = await read("server/routers.ts");
    const communications = await read("client/src/pages/AdminCommunications.tsx");

    expect(router).toContain("campaigns: protectedProcedure.query");
    expect(router).toContain("analytics: protectedProcedure.input");
    expect(router).toContain("conversions: protectedProcedure.input");
    expect(router).toContain("contacts: protectedProcedure.query");
    expect(router).toContain("createContact: protectedProcedure.input");
    expect(router).toContain("updateContact: protectedProcedure.input");
    expect(router).toContain("invitations: protectedProcedure.query");
    expect(input).toContain("consent: z.literal(true)");
    expect(db).toContain("export async function getMemberContacts(userId: number)");
    expect(db).toContain("export async function createMemberContact(userId: number");
    expect(db).toContain("export async function updateMemberContact(userId: number");
    expect(db).toContain("recordCampaignConversion");
    expect(db).toContain("export async function getAdminActivities()");
    expect(memberCenter).toContain("trpc.member.campaigns.useQuery");
    expect(memberCenter).toContain("trpc.member.analytics.useQuery");
    expect(memberCenter).toContain("trpc.member.conversions.useQuery");
    expect(memberCenter).toContain("trpc.member.contacts.useQuery");
    expect(memberCenter).toContain("trpc.member.invitations.useQuery");
    expect(communications).toContain("Comunicações preparadas");
    expect(communications).toContain("trpc.admin.invitations.useQuery");
  });
});
