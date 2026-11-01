import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/platform/config";
import Welcome from "@/components/welcome";
export const dynamic = "force-dynamic";
export default async function Page() {
  const values = await cookies();
  if (values.has("cp-identity") && values.has("cp-invitation"))
    redirect("/invite");
  return (
    <Welcome
      development={config().AUTH_MODE === "development"}
      initialIdentity={values.has("cp-identity")}
    />
  );
}
