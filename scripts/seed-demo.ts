import { createHash, randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

type Role = "admin" | "user";
type ContentKind = "article" | "material" | "faq" | "notice";
type ContentStatus = "draft" | "published" | "archived";

const DEMO_PASSWORD = "Demo1234";
const DEMO_TAG = "DEMO SEED";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Defina DATABASE_URL apontando para o banco de homologacao antes de executar o seed demo.");
  }
  return databaseUrl;
}

const pool = mysql.createPool(requireDatabaseUrl());

async function query<T extends mysql.RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

async function execute(sql: string, params: unknown[] = []) {
  const [result] = await pool.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

async function assertSafeDatabase() {
  const rows = await query<Array<{ dbName: string } & mysql.RowDataPacket>>("SELECT DATABASE() AS dbName");
  const dbName = rows[0]?.dbName ?? "";
  const explicitlyAllowed = process.env.DEMO_SEED_ALLOW_NON_DEV === "1";
  if (!explicitlyAllowed && !/(^|_)dev($|_)/i.test(dbName)) {
    throw new Error(`Seed demo bloqueado: banco atual "${dbName}" nao parece ser de desenvolvimento.`);
  }
  return dbName;
}

async function upsertUser(openId: string, name: string, email: string, role: Role) {
  await execute(
    `INSERT INTO users (openId, name, email, passwordHash, loginMethod, role, lastSignedIn)
     VALUES (?, ?, ?, ?, 'password', ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), passwordHash = VALUES(passwordHash), loginMethod = 'password', role = VALUES(role), lastSignedIn = VALUES(lastSignedIn)`,
    [openId, name, email, hashPassword(DEMO_PASSWORD), role, daysAgo(0)],
  );
  const rows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM users WHERE openId = ? LIMIT 1", [openId]);
  return rows[0].id;
}

async function upsertProfile(userId: number, slug: string, index: number, complete = true) {
  await execute(
    `INSERT INTO memberProfiles (userId, slug, bio, whatsapp, websiteUrl, photoUrl, facebookUrl, instagramUrl, address, addressNumber, postalCode, district, city, state, metricsViewedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE slug = VALUES(slug), bio = VALUES(bio), whatsapp = VALUES(whatsapp), websiteUrl = VALUES(websiteUrl), photoUrl = VALUES(photoUrl), facebookUrl = VALUES(facebookUrl), instagramUrl = VALUES(instagramUrl), address = VALUES(address), addressNumber = VALUES(addressNumber), postalCode = VALUES(postalCode), district = VALUES(district), city = VALUES(city), state = VALUES(state), metricsViewedAt = VALUES(metricsViewedAt)`,
    [
      userId,
      slug,
      complete ? `${DEMO_TAG}: perfil ficticio para demonstracao funcional.` : `${DEMO_TAG}: perfil em configuracao.`,
      complete ? `119${String(90000000 + index).slice(0, 8)}` : null,
      complete ? `https://example.com/${slug}` : null,
      complete ? `/manus-storage/demo/member-${index}.png` : null,
      complete ? `https://facebook.com/${slug}` : null,
      complete ? `https://instagram.com/${slug}` : null,
      complete ? "Rua Demonstracao" : null,
      complete ? String(100 + index) : null,
      complete ? "01001000" : null,
      complete ? "Centro" : null,
      complete ? "Sao Paulo" : null,
      complete ? "SP" : null,
      index % 2 === 0 ? daysAgo(index) : null,
    ],
  );
}

async function upsertReceiving(userId: number, index: number) {
  await execute(
    `INSERT INTO receivingPreferences (userId, holderName, method, receivingKey, instructions, pixType, pixKey, bank1Name, bank1Agency, bank1Account, bank1Type, bank1Holder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE holderName = VALUES(holderName), method = VALUES(method), receivingKey = VALUES(receivingKey), instructions = VALUES(instructions), pixType = VALUES(pixType), pixKey = VALUES(pixKey), bank1Name = VALUES(bank1Name), bank1Agency = VALUES(bank1Agency), bank1Account = VALUES(bank1Account), bank1Type = VALUES(bank1Type), bank1Holder = VALUES(bank1Holder)`,
    index % 3 === 0
      ? [userId, `Titular Demo ${index}`, "bank_transfer", "Conta bancaria demonstrativa", `${DEMO_TAG}: dados ficticios, nao usar para pagamento real.`, null, null, "Banco Demo", "0001", `00000-${index}`, "checking", `Titular Demo ${index}`]
      : [userId, `Titular Demo ${index}`, "pix", `pix.seed.${index}@example.test`, `${DEMO_TAG}: chave PIX ficticia para homologacao.`, "e-mail", `pix.seed.${index}@example.test`, null, null, null, null, null],
  );
}

async function upsertSecurityRecovery(userId: number) {
  await execute(
    `INSERT INTO userSecurityRecovery (userId, securityQuestion, securityAnswerHash)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE securityQuestion = VALUES(securityQuestion), securityAnswerHash = VALUES(securityAnswerHash)`,
    [userId, "Qual palavra pessoal voce escolheu para recuperacao?", hashPassword("security-answer:demonstracao")],
  );
}

async function upsertContent(kind: ContentKind, title: string, summary: string, body: string, status: ContentStatus, createdBy: number, resource?: { url: string; category: string; type: string }) {
  const existing = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM managedContent WHERE title = ? LIMIT 1", [title]);
  if (existing[0]) {
    await execute(
      `UPDATE managedContent SET kind = ?, summary = ?, body = ?, resourceUrl = ?, resourceCategory = ?, resourceType = ?, status = ?, createdBy = ? WHERE id = ?`,
      [kind, summary, body, resource?.url ?? null, resource?.category ?? null, resource?.type ?? null, status, createdBy, existing[0].id],
    );
    return existing[0].id;
  }
  const result = await execute(
    `INSERT INTO managedContent (kind, title, summary, body, resourceUrl, resourceCategory, resourceType, status, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kind, title, summary, body, resource?.url ?? null, resource?.category ?? null, resource?.type ?? null, status, createdBy],
  );
  return result.insertId;
}

async function upsertEbook(index: number, createdBy: number) {
  const sourceId = `demo-seed-ebook-${String(index).padStart(2, "0")}`;
  await execute(
    `INSERT INTO ebooks (sourceId, sourceFile, sourcePath, title, summary, htmlContent, status, createdBy, publishedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), htmlContent = VALUES(htmlContent), status = 'published', createdBy = VALUES(createdBy), publishedAt = VALUES(publishedAt)`,
    [
      sourceId,
      `${sourceId}.html`,
      `/demo/${sourceId}.html`,
      `${DEMO_TAG} - E-book ${index}`,
      "Material demonstrativo para validar a biblioteca de e-books.",
      `<h1>${DEMO_TAG} - E-book ${index}</h1><p>Conteudo ficticio para homologacao visual e funcional.</p>`,
      createdBy,
      daysAgo(index),
    ],
  );
  const rows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM ebooks WHERE sourceId = ? LIMIT 1", [sourceId]);
  return rows[0].id;
}

async function upsertCourse(index: number, ebookId: number) {
  const routeKey = `demo-seed-curso-${String(index).padStart(2, "0")}`;
  await execute(
    `INSERT INTO courses (title, routeKey, summary, category, durationMinutes, level, ebookId, isPublished)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), category = VALUES(category), durationMinutes = VALUES(durationMinutes), level = VALUES(level), ebookId = VALUES(ebookId), isPublished = 1`,
    [`${DEMO_TAG} - Curso ${index}`, routeKey, "Curso demonstrativo vinculado a e-book publicado.", "Divulgacao", 20 + index * 5, index % 3 === 0 ? "avancado" : index % 2 === 0 ? "pratica" : "fundamentos", ebookId],
  );
  const rows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM courses WHERE routeKey = ? LIMIT 1", [routeKey]);
  return rows[0].id;
}

async function upsertCampaign(userId: number, memberSlug: string, index: number) {
  const slug = `demo-seed-campanha-${index}`;
  await execute(
    `INSERT INTO campaignLinks (userId, name, slug, destinationUrl, source, medium, content, status, clicks, leads)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0, 0)
     ON DUPLICATE KEY UPDATE name = VALUES(name), destinationUrl = VALUES(destinationUrl), source = VALUES(source), medium = VALUES(medium), content = VALUES(content), status = 'active'`,
    [userId, `${DEMO_TAG} - Campanha ${index}`, slug, `http://127.0.0.1:3110/dev/?afiliado=${memberSlug}`, ["instagram", "facebook", "whatsapp", "youtube"][index % 4], "social", `demo-${index}`],
  );
  const rows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM campaignLinks WHERE userId = ? AND slug = ? LIMIT 1", [userId, slug]);
  return rows[0].id;
}

async function resetSeedEvents() {
  await execute("DELETE FROM campaignConversions WHERE entityType = 'demoSeed'");
  await execute("DELETE FROM campaignAttributions WHERE campaignName = 'demo-seed'");
  await execute("DELETE FROM campaignClickEvents WHERE utmCampaign = 'demo-seed'");
  await execute("DELETE FROM affiliateLinkClickEvents WHERE utmCampaign = 'demo-seed'");
}

async function insertTracking(userId: number, campaignId: number, index: number) {
  for (let i = 0; i < 8; i += 1) {
    const visitor = randomUUID();
    const session = randomUUID();
    const occurredAt = daysAgo(index * 4 + i);
    await execute(
      `INSERT INTO campaignClickEvents (campaignId, userId, visitorId, sessionId, occurredAt, referrerOrigin, userAgentCategory, deviceType, utmSource, utmMedium, utmCampaign, utmContent, landingPath)
       VALUES (?, ?, ?, ?, ?, 'demo-seed', 'human', ?, ?, 'social', 'demo-seed', ?, ?)`,
      [campaignId, userId, visitor, session, occurredAt, i % 2 === 0 ? "mobile" : "desktop", i % 2 === 0 ? "instagram" : "facebook", `demo-${i}`, `/demo-seed/r/${campaignId}/${i}`],
    );
    if (i % 3 === 0) {
      await execute(
        `INSERT INTO affiliateLinkClickEvents (userId, visitorId, sessionId, occurredAt, referrerOrigin, userAgentCategory, deviceType, utmSource, utmMedium, utmCampaign, utmContent, landingPath)
         VALUES (?, ?, ?, ?, 'demo-seed', 'human', ?, 'affiliate_link', 'referral', 'demo-seed', ?, ?)`,
        [userId, randomUUID(), randomUUID(), occurredAt, i % 2 === 0 ? "mobile" : "desktop", `principal-${i}`, `/demo-seed/?afiliado=${userId}`],
      );
    }
  }
  await execute(
    `INSERT INTO campaignConversions (campaignId, userId, conversionType, status, entityType, entityId, valueCents, captureMode, occurredAt)
     VALUES (?, ?, 'lead', 'active', 'demoSeed', ?, 0, 'manual', ?)
     ON DUPLICATE KEY UPDATE status = 'active', valueCents = VALUES(valueCents), occurredAt = VALUES(occurredAt)`,
    [campaignId, userId, campaignId * 10 + 1, daysAgo(index)],
  );
}

async function upsertApplication(ownerUserId: number, affiliateSlug: string, index: number, status: "awaiting_payment" | "receipt_received" | "confirmed" | "rejected") {
  const trackingCode = `PL-DEMO${String(index).padStart(6, "0")}`.slice(0, 24);
  await execute(
    `INSERT INTO applications (fullName, email, whatsapp, trackingCode, ownerUserId, affiliateSlug, status, paymentStatus, activationStatus, offerAmountCents, selectedPaymentMethod, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5000, 'PIX', ?)
     ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), email = VALUES(email), whatsapp = VALUES(whatsapp), ownerUserId = VALUES(ownerUserId), affiliateSlug = VALUES(affiliateSlug), status = VALUES(status), paymentStatus = VALUES(paymentStatus), activationStatus = VALUES(activationStatus), selectedPaymentMethod = 'PIX'`,
    [
      `${DEMO_TAG} Comprador ${index}`,
      `demo.comprador.${index}@example.test`,
      `1197${String(7000000 + index).slice(0, 7)}`,
      trackingCode,
      ownerUserId,
      affiliateSlug,
      status === "confirmed" ? "approved" : status === "rejected" ? "contacted" : "pending",
      status,
      status === "confirmed" ? "access_issued" : "not_started",
      daysAgo(index),
    ],
  );
  const rows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM applications WHERE trackingCode = ? LIMIT 1", [trackingCode]);
  const applicationId = rows[0].id;
  if (status === "receipt_received" || status === "confirmed" || status === "rejected") {
    const receiptStatus = status === "confirmed" ? "approved" : status === "rejected" ? "rejected" : "pending";
    const existing = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM applicationPaymentReceipts WHERE applicationId = ? AND originalName = ? LIMIT 1", [applicationId, `${DEMO_TAG.toLowerCase()}-receipt-${index}.png`]);
    if (existing[0]) {
      await execute("UPDATE applicationPaymentReceipts SET status = ?, reviewedAt = ?, reviewedBy = ? WHERE id = ?", [receiptStatus, receiptStatus === "pending" ? null : daysAgo(index - 1), receiptStatus === "pending" ? null : ownerUserId, existing[0].id]);
    } else {
      await execute(
        `INSERT INTO applicationPaymentReceipts (applicationId, ownerUserId, storageKey, fileUrl, contentType, originalName, fileSize, status, createdAt, reviewedAt, reviewedBy)
         VALUES (?, ?, ?, ?, 'image/png', ?, 128, ?, ?, ?, ?)`,
        [applicationId, ownerUserId, `demo-seed/receipts/${index}.png`, `/manus-storage/demo-seed/receipts/${index}.png`, `${DEMO_TAG.toLowerCase()}-receipt-${index}.png`, receiptStatus, daysAgo(index), receiptStatus === "pending" ? null : daysAgo(index - 1), receiptStatus === "pending" ? null : ownerUserId],
      );
    }
  }
  return applicationId;
}

async function upsertTicket(userId: number, index: number, status: "open" | "answered" | "closed") {
  const subject = `${DEMO_TAG} - Suporte ${index}`;
  const existing = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM supportTickets WHERE userId = ? AND subject = ? LIMIT 1", [userId, subject]);
  if (existing[0]) {
    await execute("UPDATE supportTickets SET message = ?, status = ?, adminResponse = ? WHERE id = ?", [`Ticket demonstrativo ${index}.`, status, status === "open" ? null : "Resposta demonstrativa da administracao.", existing[0].id]);
    return;
  }
  await execute("INSERT INTO supportTickets (userId, subject, message, status, adminResponse, createdAt) VALUES (?, ?, ?, ?, ?, ?)", [userId, subject, `Ticket demonstrativo ${index}.`, status, status === "open" ? null : "Resposta demonstrativa da administracao.", daysAgo(index)]);
}

async function upsertTestimonial(userId: number, index: number, status: "pending" | "approved" | "rejected" | "archived") {
  const content = `${DEMO_TAG}: relato ficticio ${index} criado somente para homologacao visual. Nao representa experiencia real de cliente.`;
  const existing = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM memberTestimonials WHERE userId = ? AND content = ? LIMIT 1", [userId, content]);
  if (existing[0]) {
    await execute("UPDATE memberTestimonials SET rating = ?, authorConfirmed = 1, status = ?, adminNote = ? WHERE id = ?", [3 + (index % 3), status, `${DEMO_TAG}: status de teste.`, existing[0].id]);
    return;
  }
  await execute("INSERT INTO memberTestimonials (userId, content, rating, authorConfirmed, status, adminNote, createdAt) VALUES (?, ?, ?, 1, ?, ?, ?)", [userId, content, 3 + (index % 3), status, `${DEMO_TAG}: status de teste.`, daysAgo(index)]);
}

async function main() {
  const dbName = await assertSafeDatabase();
  console.log(`Seed demo iniciado no banco ${dbName}.`);

  const adminId = await upsertUser("demo_seed_admin", `${DEMO_TAG} Admin`, "demo.admin@example.test", "admin");
  const memberIds: number[] = [];
  for (let i = 1; i <= 18; i += 1) {
    const id = await upsertUser(`demo_seed_member_${i}`, `${DEMO_TAG} Membro ${i}`, `demo.membro.${i}@example.test`, "user");
    memberIds.push(id);
    await upsertSecurityRecovery(id);
    await upsertProfile(id, `demo-seed-membro-${i}`, i, i !== 1);
    if (i !== 1) await upsertReceiving(id, i);
  }

  for (let i = 1; i < memberIds.length; i += 1) {
    const sponsorId = i < 8 ? memberIds[0] : memberIds[1];
    await execute(
      `INSERT INTO referralLinks (sponsorId, referredUserId, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE sponsorId = VALUES(sponsorId), status = VALUES(status)`,
      [sponsorId, memberIds[i], i % 6 === 0 ? "archived" : "active"],
    );
  }

  const articleBodies = ["Copy curta para WhatsApp", "Legenda para Instagram", "Texto para Facebook", "Descricao de status", "Chamada promocional", "Roteiro de abordagem", "Mensagem de follow-up", "Checklist de divulgacao"];
  for (const [index, label] of articleBodies.entries()) {
    await upsertContent("article", `${DEMO_TAG} - ${label}`, "Material demonstrativo para divulgacao.", `Conteudo ficticio: ${label}. Use apenas para homologacao.`, index % 5 === 0 ? "draft" : "published", adminId);
  }
  const resourceCategories = ["Automacao", "Divulgacao", "Produtividade", "Redes sociais", "Outros"];
  for (let i = 1; i <= 10; i += 1) {
    await upsertContent("material", `${DEMO_TAG} - Recurso ${i}`, "Recurso demonstrativo da Biblioteca de Recursos.", "Tutorial ficticio do recurso. O arquivo permanece no Google Drive.", i % 7 === 0 ? "archived" : "published", adminId, {
      url: `https://drive.google.com/file/d/demo-seed-${i}/view`,
      category: resourceCategories[i % resourceCategories.length],
      type: ["Aplicativo", "Ferramenta", "Pacote de arquivos", "Material complementar"][i % 4],
    });
  }
  for (let i = 1; i <= 4; i += 1) {
    await upsertContent("faq", `${DEMO_TAG} - Pergunta frequente ${i}`, "FAQ demonstrativo.", "Resposta ficticia para homologacao.", "published", adminId);
    await upsertContent("notice", `${DEMO_TAG} - Comunicado ${i}`, "Comunicado demonstrativo.", "Comunicacao ficticia para validar listagens.", i === 4 ? "draft" : "published", adminId);
  }

  const ebookIds: number[] = [];
  for (let i = 1; i <= 6; i += 1) ebookIds.push(await upsertEbook(i, adminId));
  const courseIds: number[] = [];
  for (let i = 1; i <= 6; i += 1) courseIds.push(await upsertCourse(i, ebookIds[(i - 1) % ebookIds.length]));
  for (let i = 0; i < courseIds.length; i += 1) {
    await execute(
      `INSERT INTO courseProgress (userId, courseId, progressPercent, lastAccessedAt)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE progressPercent = VALUES(progressPercent), lastAccessedAt = VALUES(lastAccessedAt)`,
      [memberIds[i % memberIds.length], courseIds[i], (i * 20) % 101, daysAgo(i)],
    );
  }

  await resetSeedEvents();
  const campaignIds: number[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const memberIndex = ((i - 1) % 6) + 1;
    const userId = memberIds[memberIndex];
    const campaignId = await upsertCampaign(userId, `demo-seed-membro-${memberIndex + 1}`, i);
    campaignIds.push(campaignId);
    await insertTracking(userId, campaignId, i);
  }

  for (let i = 1; i <= 12; i += 1) {
    const userId = memberIds[i % memberIds.length];
    const campaignId = campaignIds[i % campaignIds.length] ?? null;
    const email = `demo.contato.${i}@example.test`;
    const existing = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM memberContacts WHERE email = ? LIMIT 1", [email]);
    const values = [userId, campaignId, `${DEMO_TAG} Contato ${i}`, email, `1198${String(8000000 + i).slice(0, 7)}`, "Seed demo", "Consentimento ficticio para homologacao.", campaignId ? "campaign" : "manual", ["new", "contacted", "qualified", "archived"][i % 4], daysAgo(i)];
    if (existing[0]) {
      await execute(
        "UPDATE memberContacts SET userId = ?, campaignId = ?, name = ?, whatsapp = ?, source = ?, consentNote = ?, captureType = ?, status = ? WHERE id = ?",
        [userId, campaignId, `${DEMO_TAG} Contato ${i}`, `1198${String(8000000 + i).slice(0, 7)}`, "Seed demo", "Consentimento ficticio para homologacao.", campaignId ? "campaign" : "manual", ["new", "contacted", "qualified", "archived"][i % 4], existing[0].id],
      );
    } else {
      await execute(
        `INSERT INTO memberContacts (userId, campaignId, name, email, whatsapp, source, consentNote, captureType, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
      );
    }
  }

  const appStatuses: Array<"awaiting_payment" | "receipt_received" | "confirmed" | "rejected"> = ["awaiting_payment", "receipt_received", "confirmed", "confirmed", "rejected"];
  for (let i = 1; i <= 18; i += 1) {
    const ownerIndex = i % 6;
    await upsertApplication(memberIds[ownerIndex], `demo-seed-membro-${ownerIndex + 1}`, i, appStatuses[i % appStatuses.length]);
  }

  for (let i = 1; i <= 12; i += 1) {
    const userId = memberIds[i % memberIds.length];
    const transactionDescription = `${DEMO_TAG} - Lancamento ${i}`;
    const transactionRows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM transactions WHERE userId = ? AND description = ? LIMIT 1", [userId, transactionDescription]);
    if (transactionRows[0]) {
      await execute(
        "UPDATE transactions SET createdBy = ?, campaignId = ?, type = ?, amountCents = ?, status = ?, adminNote = ?, occurredAt = ? WHERE id = ?",
        [adminId, campaignIds[i % campaignIds.length] ?? null, i % 2 === 0 ? "sale" : "adjustment", i % 4 === 0 ? -500 : 5000, ["posted", "pending", "void"][i % 3], `${DEMO_TAG}: transacao ficticia.`, daysAgo(i), transactionRows[0].id],
      );
    } else {
      await execute(
        `INSERT INTO transactions (userId, createdBy, campaignId, type, description, amountCents, status, adminNote, occurredAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, adminId, campaignIds[i % campaignIds.length] ?? null, i % 2 === 0 ? "sale" : "adjustment", transactionDescription, i % 4 === 0 ? -500 : 5000, ["posted", "pending", "void"][i % 3], `${DEMO_TAG}: transacao ficticia.`, daysAgo(i)],
      );
    }
    const pointReason = `${DEMO_TAG} - Pontos ${i}`;
    const pointRows = await query<Array<{ id: number } & mysql.RowDataPacket>>("SELECT id FROM pointEntries WHERE userId = ? AND reason = ? LIMIT 1", [userId, pointReason]);
    if (pointRows[0]) {
      await execute("UPDATE pointEntries SET amount = ?, status = ?, createdBy = ? WHERE id = ?", [i % 5 === 0 ? -10 : 10 + i, ["posted", "pending", "void"][i % 3], adminId, pointRows[0].id]);
    } else {
      await execute(
        "INSERT INTO pointEntries (userId, amount, reason, status, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, i % 5 === 0 ? -10 : 10 + i, pointReason, ["posted", "pending", "void"][i % 3], adminId, daysAgo(i)],
      );
    }
  }

  for (let i = 1; i <= 8; i += 1) await upsertTicket(memberIds[i % memberIds.length], i, ["open", "answered", "closed"][i % 3] as "open" | "answered" | "closed");
  const testimonialStatuses: Array<"pending" | "approved" | "rejected" | "archived"> = ["pending", "approved", "approved", "rejected", "archived"];
  for (let i = 1; i <= 12; i += 1) await upsertTestimonial(memberIds[i % memberIds.length], i, testimonialStatuses[i % testimonialStatuses.length]);

  const counts = await query<Array<{ entity: string; count: number } & mysql.RowDataPacket>>(`
    SELECT 'users' entity, COUNT(*) count FROM users
    UNION ALL SELECT 'memberProfiles', COUNT(*) FROM memberProfiles
    UNION ALL SELECT 'receivingPreferences', COUNT(*) FROM receivingPreferences
    UNION ALL SELECT 'referralLinks', COUNT(*) FROM referralLinks
    UNION ALL SELECT 'managedContent', COUNT(*) FROM managedContent
    UNION ALL SELECT 'ebooks', COUNT(*) FROM ebooks
    UNION ALL SELECT 'courses', COUNT(*) FROM courses
    UNION ALL SELECT 'campaignLinks', COUNT(*) FROM campaignLinks
    UNION ALL SELECT 'campaignClickEvents', COUNT(*) FROM campaignClickEvents
    UNION ALL SELECT 'affiliateLinkClickEvents', COUNT(*) FROM affiliateLinkClickEvents
    UNION ALL SELECT 'campaignConversions', COUNT(*) FROM campaignConversions
    UNION ALL SELECT 'applications', COUNT(*) FROM applications
    UNION ALL SELECT 'applicationPaymentReceipts', COUNT(*) FROM applicationPaymentReceipts
    UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
    UNION ALL SELECT 'pointEntries', COUNT(*) FROM pointEntries
    UNION ALL SELECT 'supportTickets', COUNT(*) FROM supportTickets
    UNION ALL SELECT 'memberTestimonials', COUNT(*) FROM memberTestimonials
  `);
  console.table(counts.map(row => ({ entity: row.entity, count: Number(row.count) })));
  console.log(`Contas demo seedadas usam senha ${DEMO_PASSWORD}.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
