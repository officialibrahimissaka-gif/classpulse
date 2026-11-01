import { config } from "@/platform/config";
import Invitation from "@/components/invitation";
export const dynamic = "force-dynamic";
export default function Page() {
  return <Invitation development={config().AUTH_MODE === "development"} />;
}
