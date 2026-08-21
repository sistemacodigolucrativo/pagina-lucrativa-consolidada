import ApplicationPersonalization from "./ApplicationPersonalization";
import { withAppBase } from "@/lib/devPath";

export default function PersonalizeAccess() {
  withAppBase("/personalizar");
  return <ApplicationPersonalization />;
}
