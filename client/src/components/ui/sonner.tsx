import { useTheme } from "next-themes";
import { useEffect, type CSSProperties } from "react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

const Toaster = ({ toastOptions, offset, mobileOffset, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const toastElement = target.closest("[data-sonner-toast]");
      if (!toastElement) return;
      if (target.closest("button, a, input, textarea, select")) return;
      toast.dismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset={offset ?? { top: 88, right: 24 }}
      mobileOffset={mobileOffset ?? { top: 76, right: 12, left: 12 }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: ["codigo-operational-toast", toastOptions?.classNames?.toast].filter(Boolean).join(" "),
        },
      }}
      style={
        {
          "--width": "min(440px, calc(100vw - 32px))",
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
