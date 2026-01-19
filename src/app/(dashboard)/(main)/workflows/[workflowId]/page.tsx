import { requireAuth } from "@/lib/auth-utils";

type PageProps = {
    params: Promise<{
        workflowId: string;
    }>
}



const WorkflowId = async ({params}: PageProps) => {
  await requireAuth();
    const {workflowId} = await params;
  return (
    <div>workflowId: {workflowId}</div>
  )
}

export default WorkflowId