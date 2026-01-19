import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
    params: Promise<{
        executionId: string;
    }>
}



const ExecutionId = async ({params}: PageProps) => {
  await requireAuth();
    const {executionId} = await params;
  return (
    <div>ExecutionId: {executionId}</div>
  )
}

export default ExecutionId