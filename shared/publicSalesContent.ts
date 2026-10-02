import {
  PUBLIC_SALES_COPY_SECTIONS,
  defaultValuesForSection,
  type PublicSalesCopyOverrides,
} from "./publicSalesCopyEditor";

export type PublicSalesContentSection = Readonly<Record<string, string>>;

export type PublicSalesContentSnapshot = {
  sections: Readonly<Record<string, PublicSalesContentSection>>;
  overriddenFields: Readonly<Record<string, readonly string[]>>;
  packageItems: readonly {
    id: string;
    title: string;
    description: string;
  }[];
  fitItems: readonly string[];
  notFitItems: readonly string[];
  objectionItems: readonly {
    id: string;
    question: string;
    answer: string;
  }[];
};

function numberedKeys(
  section: PublicSalesContentSection,
  expression: RegExp
) {
  return Object.keys(section)
    .map(key => {
      const match = key.match(expression);
      return match ? { key, index: Number(match[1]) } : null;
    })
    .filter((entry): entry is { key: string; index: number } => entry !== null)
    .sort((first, second) => first.index - second.index);
}

export function resolvePublicSalesContent(
  overrides: PublicSalesCopyOverrides = {}
): PublicSalesContentSnapshot {
  const sections: Record<string, Record<string, string>> = {};
  const overriddenFields: Record<string, string[]> = {};

  for (const section of PUBLIC_SALES_COPY_SECTIONS) {
    const defaults = defaultValuesForSection(section);
    const validKeys = new Set(section.fields.map(field => field.key));
    const sectionOverrides = overrides[section.id];
    const validOverrides: Record<string, string> = {};

    if (sectionOverrides && typeof sectionOverrides === "object") {
      for (const [key, value] of Object.entries(sectionOverrides)) {
        if (validKeys.has(key) && typeof value === "string") {
          validOverrides[key] = value;
        }
      }
    }

    sections[section.id] = { ...defaults, ...validOverrides };
    overriddenFields[section.id] = Object.keys(validOverrides);
  }

  const packageSection = sections.package ?? {};
  const packageItems = numberedKeys(packageSection, /^item(\d+)Title$/).map(
    ({ index }) => ({
      id: `item${index}`,
      title: packageSection[`item${index}Title`] ?? "",
      description: packageSection[`item${index}Text`] ?? "",
    })
  );

  const fitSection = sections.fit ?? {};
  const fitItems = numberedKeys(fitSection, /^fit(\d+)$/).map(
    ({ key }) => fitSection[key] ?? ""
  );
  const notFitItems = numberedKeys(fitSection, /^not(\d+)$/).map(
    ({ key }) => fitSection[key] ?? ""
  );

  const objectionsSection = sections.objections ?? {};
  const objectionItems = numberedKeys(objectionsSection, /^q(\d+)$/).map(
    ({ index }) => ({
      id: `objection${index}`,
      question: objectionsSection[`q${index}`] ?? "",
      answer: objectionsSection[`a${index}`] ?? "",
    })
  );

  return {
    sections,
    overriddenFields,
    packageItems,
    fitItems,
    notFitItems,
    objectionItems,
  };
}

export function getPublicSalesContentValue(
  content: PublicSalesContentSnapshot,
  sectionId: string,
  fieldKey: string
) {
  return content.sections[sectionId]?.[fieldKey];
}

export function getPublicSalesContentOverride(
  content: PublicSalesContentSnapshot,
  sectionId: string,
  fieldKey: string
) {
  if (!content.overriddenFields[sectionId]?.includes(fieldKey)) return undefined;
  return getPublicSalesContentValue(content, sectionId, fieldKey);
}