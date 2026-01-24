import { requireAuth } from "@/lib/auth-utils";
import React from "react";

const Executions = async () => {
  await requireAuth();
  return <div>Executions</div>;
};

export default Executions;
