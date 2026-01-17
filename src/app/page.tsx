import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import LogoutButton from "./logout";

const HomePage = async () => {
  const session = await requireAuth();

  const data = await caller.getUsers();
  return (
    <>
      protected server component
      {JSON.stringify(data)}
      <LogoutButton />
    </>
  );
};

export default HomePage;
