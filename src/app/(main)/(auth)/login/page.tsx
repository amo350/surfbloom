import LoginForm from "@/features/auth/components/LoginForm";
import { requireUnAuth } from "@/lib/auth-utils";

const LoginPage = async () => {
  await requireUnAuth();
  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
