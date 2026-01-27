import { useQueryStates } from "nuqs";
import { workspacesParams } from "../params";

export const useWorkspacesParams = () => {
  return useQueryStates(workspacesParams);
};
