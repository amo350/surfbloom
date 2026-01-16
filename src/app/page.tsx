import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  return (
    <>
      <div>hi</div>
      <Button>HomePage</Button>
    </>
  );
};

export default HomePage;
