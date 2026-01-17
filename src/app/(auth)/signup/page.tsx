import SignUpForm from "@/features/auth/components/SignUpForm";
import { requireUnAuth } from "@/lib/auth-utils";
import React from "react";

const SignUpPage = async () => {
  await requireUnAuth();
  return (
    <div>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
