import type { ComponentType } from "react";
import {
  getPublicPageTemplateDefinition,
  PUBLIC_PAGE_TEMPLATE_REGISTRY,
  type PublicPageTemplate,
} from "@shared/publicPageTemplate";
import type { PublicSalesContentSnapshot } from "@shared/publicSalesContent";
import Home from "./Home";

type PublicSalesPageProps = {
  content: PublicSalesContentSnapshot;
};

type PublicSalesTemplateDefinition = {
  label: string;
  description: string;
  component: ComponentType<PublicSalesPageProps>;
  wrapper:
    | {
        className: string;
        dataPublicTemplate: PublicPageTemplate;
      }
    | null;
};

export const PUBLIC_SALES_TEMPLATE_REGISTRY = {
  official: {
    ...PUBLIC_PAGE_TEMPLATE_REGISTRY.official,
    component: Home,
    wrapper: null,
  },
  premium: {
    ...PUBLIC_PAGE_TEMPLATE_REGISTRY.premium,
    component: Home,
    wrapper: {
      className: "public-sales-premium-preview real-public-sales-preview",
      dataPublicTemplate: "premium",
    },
  },
} satisfies Record<PublicPageTemplate, PublicSalesTemplateDefinition>;

export function resolvePublicSalesTemplate(value: unknown) {
  const { id } = getPublicPageTemplateDefinition(value);
  return {
    id,
    ...PUBLIC_SALES_TEMPLATE_REGISTRY[id],
  };
}

export function PublicSalesTemplateRenderer({
  template,
  content,
}: PublicSalesPageProps & { template: unknown }) {
  const definition = resolvePublicSalesTemplate(template);
  const Page = definition.component;
  const page = <Page content={content} />;

  if (!definition.wrapper) return page;

  return (
    <div
      className={definition.wrapper.className}
      data-public-template={definition.wrapper.dataPublicTemplate}
    >
      {page}
    </div>
  );
}