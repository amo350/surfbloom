import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SurfBloomLanding from "@/components/marketing/components/SurfBloomLanding";

const isAppHost = (host: string) =>
  host === "app.surfbloom.com" || host.startsWith("app.surfbloom.com:");

export default async function MarketingHomePage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";

  if (isAppHost(host)) {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (session) {
      redirect("/index/locations");
    }

    redirect("/login");
  }

  return <SurfBloomLanding />;
}
