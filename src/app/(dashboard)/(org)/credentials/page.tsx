import { AppHeader, AppHeaderTitle } from "@/components/AppHeader";
import { requireAuth } from "@/lib/auth-utils";
import React from "react";

const Credentials = async () => {
  await requireAuth();
  return (
    <>
      <AppHeader>
        <AppHeaderTitle title="Credentials" description="Manage your API credentials" />
      </AppHeader>
      <div className="p-6">Credentials</div>
    </>
  );
};

export default Credentials;
