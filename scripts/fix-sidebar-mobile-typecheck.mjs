import { readFileSync, writeFileSync } from "node:fs";

const path = "client/src/components/DashboardLayout.tsx";
let source = readFileSync(path, "utf8");

source = source.replace(
  'const { state, toggleSidebar, setOpenMobile } = useSidebar();',
  'const { state, toggleSidebar, openMobile, setOpenMobile } = useSidebar();'
);

source = source.replace(
  'setOpenMobile(current => !current);',
  'setOpenMobile(!openMobile);'
);

writeFileSync(path, source);
console.log("Sidebar mobile typecheck fix applied.");
// trigger
