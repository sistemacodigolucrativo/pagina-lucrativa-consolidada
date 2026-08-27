import { useEffect } from "react";
import { withAppBase } from "@/lib/devPath";
import { PUBLIC_SALES_COPY_SECTIONS, type PublicSalesCopyOverrides } from "@shared/publicSalesCopyEditor";

function sectionRoot(section: (typeof PUBLIC_SALES_COPY_SECTIONS)[number]) {
  if (typeof document === "undefined") return null;
  if (typeof section.referenceCopyIndex === "number") {
    return document.querySelectorAll<HTMLElement>("section.reference-copy")[section.referenceCopyIndex] ?? null;
  }
  return section.sectionSelector ? document.querySelector<HTMLElement>(section.sectionSelector) : null;
}

function queryWithin(root: HTMLElement, selector: string) {
  const normalized = selector.trim().startsWith(">") ? `:scope ${selector.trim()}` : selector;
  return root.querySelector<HTMLElement>(normalized);
}

function applyStructureSummary(root: HTMLElement, key: string, value: string) {
  if (key !== "group1items" && key !== "group2items") return false;
  const groupIndex = key === "group1items" ? 1 : 2;
  const items = value.split("·").map(item => item.trim()).filter(Boolean);
  const nodes = root.querySelectorAll<HTMLElement>(`.sales-proof-group:nth-child(${groupIndex}) .sales-proof-items span`);
  nodes.forEach((node, index) => {
    if (items[index] && node.textContent !== items[index]) node.textContent = items[index];
  });
  return true;
}

function applyOverrides(overrides: PublicSalesCopyOverrides) {
  for (const section of PUBLIC_SALES_COPY_SECTIONS) {
    const values = overrides[section.id];
    if (!values) continue;
    const root = sectionRoot(section);
    if (!root) continue;
    for (const field of section.fields) {
      const value = values[field.key];
      if (typeof value !== "string") continue;
      if (section.id === "structure_summary" && applyStructureSummary(root, field.key, value)) continue;
      if (!field.selector) continue;
      const target = queryWithin(root, field.selector);
      if (target && target.textContent !== value) target.textContent = value;
    }
  }
}

export default function PublicSalesCopyRuntime() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let queued = false;
    let overrides: PublicSalesCopyOverrides = {};

    const scheduleApply = () => {
      if (queued || cancelled) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        if (!cancelled) applyOverrides(overrides);
      });
    };

    fetch(withAppBase("/api/public-sales-copy"), { credentials: "include" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Falha ao carregar copy pública")))
      .then((payload: { overrides?: PublicSalesCopyOverrides }) => {
        if (cancelled) return;
        overrides = payload.overrides ?? {};
        scheduleApply();
        observer = new MutationObserver(scheduleApply);
        observer.observe(document.body, { childList: true, subtree: true });
      })
      .catch(error => console.warn("[PublicSalesCopy] configuração indisponível:", error));

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
