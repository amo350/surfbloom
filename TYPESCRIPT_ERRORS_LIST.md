# TypeScript / Build Errors – List for Troubleshooting

Each entry: **File** → **Error** → **Code snippet**. Fix the root cause first (see #1), then re-run `npx tsc --noEmit` and address remaining errors.

---

## 1. Missing `AppRouter` type (fix this first)

**File:** `src/trpc/client.tsx`  
**Line:** 9  
**Error:** `'"./routers/_app"' has no exported member named 'AppRouter'. Did you mean 'appRouter'?`

**Snippet:**

```ts
import type { AppRouter } from "./routers/_app";
```

**Fix:** In `src/trpc/routers/_app.ts`, add:

```ts
export type AppRouter = typeof appRouter;
```

Then the client can keep `import type { AppRouter } from "./routers/_app";`. Until this is fixed, tRPC types may be wrong everywhere.

---

## 2. Settings context – `workspace` typed as `{}`

**File:** `src/app/(dashboard)/workspaces/[workspaceId]/settings/settings-context.tsx`  
**Lines:** 39, 40, 50, 58  
**Error:** `Property 'name' | 'imageUrl' | 'inviteCode' does not exist on type '{}'.`

**Snippets:**

```tsx
name: workspace.name,           // L39
imageUrl: workspace.imageUrl ?? null,  // L40
inviteCode={workspace.inviteCode}      // L50
workspaceName={workspace.name}         // L58
```

**Cause:** `useQuery(trpc.workspaces.getOne.queryOptions(...))` data is inferred as `{}`. Type the result (e.g. cast to your Workspace type or ensure AppRouter is correct).

---

## 3. WorkplaceSwitcher – `workspacesData` / `currentWorkspace` typed as `{}`

**File:** `src/components/WorkplaceSwitcher.tsx`  
**Lines:** 79, 80, 82, 127, 188  
**Errors:** `Property 'items' | 'name' does not exist on type '{}'`; Parameter `w` / `workspace` implicitly has an 'any' type.

**Snippets:**

```tsx
const otherWorkspaces = workspacesData.items.filter(  // L79
  (w) => w.id !== workspaceId,   // L80 – w any
);
const filteredWorkspaces = otherWorkspaces.filter((w) =>  // L82 – w any
  w.name.toLowerCase().includes(searchValue.toLowerCase()),
);
// ...
{currentWorkspace.name}   // L127
filteredWorkspaces.map((workspace) => ( ...  // L188 – workspace any
```

**Cause:** `useQuery(trpc.workspaces.getOne/getMany.queryOptions(...))` data inferred as `{}`. Type query results (e.g. Workspace and `{ items: Workspace[], ... }`) or fix AppRouter so inference works.

---

## 4. Editor – `workflow` is `unknown`

**File:** `src/features/editor/components/editor.tsx`  
**Lines:** 62, 63  
**Error:** `'workflow' is of type 'unknown'.`

**Snippet:**

```tsx
const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
const [edges, setEdges] = useState<Edge[]>(workflow.edges);
```

**Cause:** `useSuspenseWorkflow` (or `useSuspenseQuery(trpc.workflows.getOne.queryOptions(...))`) returns `unknown`. Type the hook’s return or the query options so `workflow` has a proper type.

---

## 5. EditorHeader – `workflow` unknown + `mutate` expects `void`

**File:** `src/features/editor/components/EditorHeader.tsx`  
**Lines:** 41, 68, 73, 74, 76, 86, 91, 97, 107, 131  
**Errors:** `'workflow' is of type 'unknown'`; `Argument of type '{ id, workspaceId, nodes, edges }' is not assignable to parameter of type 'void'` (and similar for update name).

**Snippets:**

```tsx
saveWorkflow.mutate({ id: workflowId, workspaceId, nodes, edges }); // L41
const [name, setName] = useState(workflow.name); // L68
if (workflow.name) {
  setName(workflow.name);
} // L73, 74, 76, 86, 97, 107, 131
await updateWorkflow.mutateAsync({ id: workflowId, workspaceId, name }); // L91
```

**Cause:** Same as #4 for `workflow`. For `mutate`/`mutateAsync`, the hooks (e.g. `useUpdateWorkflow`, save workflow) are typed so mutation variables are `void`. Type the mutation hooks so they accept the real input type (e.g. `{ id, workspaceId, nodes?, edges? }` and `{ id, workspaceId, name }`).

---

## 6. ExecuteWorkflowButton – `mutate` expects `void`

**File:** `src/features/editor/components/ExecuteWorkflowButton.tsx`  
**Line:** 15  
**Error:** `Argument of type '{ id: string; workspaceId: string; }' is not assignable to parameter of type 'void'.`

**Snippet:**

```tsx
executeWorkflow.mutate({ id: workflowId, workspaceId });
```

**Cause:** `useExecuteWorkflow()` is inferred to take no args. Type the mutation input in the hook (e.g. `{ id: string; workspaceId: string }`).

---

## 7. Execution view – `execution` is `unknown`

**File:** `src/features/executions/components/execution.tsx`  
**Lines:** 47, 49, 50, 59, 61, 63, 77 (x2), 79, 84, 89, 92, 98, 115, 118, 123, 127, 131, 145, 151, 155  
**Error:** `'execution' is of type 'unknown'.`

**Snippet (representative):**

```tsx
const { data: execution } = useSuspenseExecution(executionId);
// ...
const duration = execution.completeAt ? ...  // L47
execution.startedAt  // L49, 50
execution.status     // L59, etc.
execution.workflow.name  // L63
// (all other uses of execution.*)
```

**Cause:** `useSuspenseExecution` (or the underlying tRPC suspense query) returns `unknown`. Type the hook/query so the execution type is known.

---

## 8. Executions list/pagination – `executions.data` / `execution` unknown

**File:** `src/features/executions/components/executions.tsx`  
**Lines:** 37, 38, 40, 65, 66  
**Errors:** `'executions.data' is of type 'unknown'`; `'execution' is of type 'unknown'`; `Type 'unknown' is not assignable to type '{ ... }'` (Execution type).

**Snippets:**

```tsx
items={executions.data.items}           // L37
getKey={(execution) => execution.id}   // L38
renderItem={(execution) => <ExecutionItem data={execution} />}  // L40 – execution not assignable
// ...
totalPages={executions.data.totalPages}  // L65
page={executions.data.page}             // L66
```

**Cause:** `useSuspenseExecutions` (or tRPC suspense query) returns data typed as `unknown`. Type the hook so `executions.data` (and items) have the correct shape.

---

## 9. InviteMemberForm – `mutate` expects `void`

**File:** `src/features/invitations/components/InviteMemberForm.tsx`  
**Line:** 54  
**Error:** `Argument of type '{ workspaceId: string; email: string; role: "ADMIN" | "MEMBER"; }' is not assignable to parameter of type 'void'.`

**Snippet:**

```tsx
createInvitation.mutate(
  { workspaceId, email: values.email, role: values.role },
  { onSuccess: () => { ... } },
);
```

**Cause:** `useCreateInvitation()` mutation is inferred as no-arg. Type the mutation input in the invitations hook (e.g. `{ workspaceId, email, role }`).

---

## 10. Invitations hooks – implicit `any`

**File:** `src/features/invitations/hooks/use-invitations.ts`  
**Lines:** 18, 26, 39, 47, 60  
**Error:** Parameter 'data' | 'variables' | 'error' | '\_' implicitly has an 'any' type.

**Snippets:**

```ts
onSuccess: (data, variables) => { ... }   // L18
onError: (error) => { ... }               // L26
onSuccess: (_, variables) => { ... }       // L39
onError: (error) => { ... }                // L47
onSuccess: (data) => { ... }               // L60
```

**Fix:** Add explicit types to callbacks (e.g. data/variables/error types from your API or tRPC types).

---

## 11. Members content – `members` / `invitations` typed as `{}`

**File:** `src/features/members/components/members-content.tsx`  
**Lines:** 74, 78, 117, 123, 129, 151  
**Errors:** `Property 'length' | 'map' does not exist on type '{}'`; Parameter 'member' | 'invitation' implicitly has an 'any' type; `Argument of type '{ id: any; workspaceId: string; }' is not assignable to parameter of type 'void'.`

**Snippets:**

```tsx
Members ({members?.length || 0})           // L74
{members?.map((member) => ( ...           // L78
Pending Invitations ({invitations?.length || 0})  // L117
invitations?.length === 0                 // L123
{invitations?.map((invitation) => ( ...    // L129
removeInvitation.mutate({ id: invitation.id, workspaceId })  // L151
```

**Cause:** Query results for members/invitations inferred as `{}`; mutation for remove typed as `void`. Type the queries (e.g. members list and invitations list) and the remove-invitation mutation input.

---

## 12. Members hooks – implicit `any`

**File:** `src/features/members/hooks/use-members.ts`  
**Lines:** 22, 30, 43, 51  
**Error:** Parameter '\_' | 'variables' | 'error' implicitly has an 'any' type.

**Snippets:**

```ts
onSuccess: (_, variables) => { ... }   // L22
onError: (error) => { ... }            // L30
onSuccess: (_, variables) => { ... }   // L43
onError: (error) => { ... }            // L51
```

**Fix:** Add types for the callback parameters (e.g. from tRPC or your API types).

---

## 13. Workflows list/header/pagination – `workflows.data` / `data` unknown + `mutate` expects `void`

**File:** `src/features/workflows/components/workflows.tsx`  
**Lines:** 56, 57, 59, 78, 81, 121, 122, 158, 164, 191  
**Errors:** `'workflows.data' | 'workflows' | 'data' is of type 'unknown'`; `Type 'unknown' is not assignable to type 'Workflow'`; `Argument of type '{ workspaceId: string; }' | '{ id: string; workspaceId: string; }' is not assignable to parameter of type 'void'.`

**Snippets:**

```tsx
items={workflows.data.items}                    // L56, 57
renderItem={(workflow) => <WorkflowItem data={workflow} ...  // L59
createWorkflow.mutate({ workspaceId }, { ... });            // L78
router.push(`.../${data.id}`);  // L81 – data unknown
totalPages={workflows.data.totalPages}  // L121
page={workflows.data.page}              // L122
createWorkflow.mutate({ workspaceId }, { ... });  // L158
router.push(`.../${data.id}`);  // L164 – data unknown
removeWorkflow.mutate({ id: data.id, workspaceId });  // L191
```

**Cause:** Suspense query for workflows returns `unknown`; create/remove workflow mutations typed as `void`. Type the workflows query result and the mutation inputs.

---

## 14. Workflows hooks – implicit `any`

**File:** `src/features/workflows/hooks/use-workflows.tsx`  
**Lines:** 24, 28, 41, 46, 68, 73, 87, 92, 103, 106  
**Error:** Parameter 'data' | 'error' implicitly has an 'any' type.

**Snippets:**

```ts
onSuccess: (data) => { ... }   // L24, 41, 68, 87, 103
onError: (error) => { ... }    // L28, 46, 73, 92, 106
```

**Fix:** Type `data` and `error` (e.g. with your Workflow type and `Error` or tRPC error type).

---

## 15. EditWorkspaceForm – `mutate` expects `void`

**File:** `src/features/workspaces/components/EditWorkspaceForm.tsx`  
**Line:** 50  
**Error:** `Argument of type '{ id: string; name: string; imageUrl: string | null | undefined; }' is not assignable to parameter of type 'void'.`

**Snippet:**

```tsx
updateWorkspace.mutate({
  id: workspaceId,
  name: values.name,
  imageUrl,
});
```

**Cause:** `useUpdateWorkspace()` is inferred to take no args. Type the mutation input in the workspace hooks.

---

## 16. Workspaces components – `createWorkspace.mutate` / `data` / `workspaces.data` / `removeWorkspace.mutate` / `updateWorkspace.mutate`

**File:** `src/features/workspaces/components/workspaces.tsx`  
**Lines:** 86, 89, 91, 171, 181, 192, 290, 432  
**Errors:** `Argument of type '{ name: string; imageUrl?: ... }' is not assignable to parameter of type 'void'`; `'data' is of type 'unknown'`; `'workspaces.data' is of type 'unknown'`; Parameter 'workspace' implicitly has an 'any' type; same for remove and update mutations.

**Snippets:**

```tsx
createWorkspace.mutate(values, { onSuccess: (data) => { ... } });  // L86 – mutate void, data unknown
data.id  // L89, 91
workspaces.data.items.length   // L171
workspaces.data.items          // L181
workspaces.data.items.map((workspace) => ...  // L192 – workspace any
removeWorkspace.mutate({ id: data.id });     // L290
updateWorkspace.mutate({ id: workspace.id, name: values.name, imageUrl: values.imageUrl });  // L432
```

**Cause:** Create/update/remove workspace mutations typed as `void`; suspense/query data typed as `unknown`. Type mutation inputs and query/suspense result (e.g. Workspace and list shape).

---

## 17. WorkspaceSettings – `resetInviteCode.mutate` / `removeWorkspace.mutate` expect `void`

**File:** `src/features/workspaces/components/WorkspaceSettings.tsx`  
**Lines:** 54, 128  
**Error:** `Argument of type '{ id: string; }' is not assignable to parameter of type 'void'.`

**Snippets:**

```tsx
resetInviteCode.mutate({ id: workspaceId }); // L54
removeWorkspace.mutate(
  { id: workspaceId },
  { onSuccess: () => router.push("/index/locations") },
); // L128
```

**Cause:** `useResetInviteCode()` and `useRemoveWorkspace()` are inferred to take no args. In `src/features/workspaces/hooks/use-workspaces.ts`, type the mutation so the variable is `{ id: string }` (e.g. explicit `mutationFn` with typed input).

---

## 18. use-workspaces – implicit `any` in callbacks

**File:** `src/features/workspaces/hooks/use-workspaces.ts`  
**Lines:** 27, 31, 43, 47, 59, 66, 79, 83, 96, 102, 115, 122  
**Error:** Parameter 'data' | 'error' implicitly has an 'any' type.

**Snippets:**

```ts
onSuccess: (data) => { ... }   // L27, 43, 59, 79, 96, 115
onError: (error) => { ... }    // L31, 47, 66, 83, 102, 122
```

**Fix:** Add types for `data` (e.g. Workspace) and `error` (e.g. `Error`) in each mutation’s `onSuccess` / `onError`.

---

## Summary

| #     | File                                                                                    | Main issue                                                                                  |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1     | `src/trpc/routers/_app.ts`                                                              | Export `AppRouter` type (fix first).                                                        |
| 2     | `settings-context.tsx`                                                                  | Type `workspace` from workspaces.getOne.                                                    |
| 3     | `WorkplaceSwitcher.tsx`                                                                 | Type workspaces query data and callback params.                                             |
| 4–6   | `editor.tsx`, `EditorHeader.tsx`, `ExecuteWorkflowButton.tsx`                           | Type workflow query + mutation inputs.                                                      |
| 7–8   | `execution.tsx`, `executions.tsx`                                                       | Type execution(s) query data.                                                               |
| 9–10  | `InviteMemberForm.tsx`, `use-invitations.ts`                                            | Type create mutation input + callback params.                                               |
| 11–12 | `members-content.tsx`, `use-members.ts`                                                 | Type members/invitations query + remove mutation + callbacks.                               |
| 13–14 | `workflows.tsx`, `use-workflows.tsx`                                                    | Type workflows query + create/remove mutation + callbacks.                                  |
| 15–18 | `EditWorkspaceForm.tsx`, `workspaces.tsx`, `WorkspaceSettings.tsx`, `use-workspaces.ts` | Type workspace mutations (update/create/remove/resetInviteCode) and query data + callbacks. |

After adding `export type AppRouter = typeof appRouter` in `src/trpc/routers/_app.ts`, run `npx tsc --noEmit` again; many of these may clear once the router type is correct. Then fix remaining mutation “parameter of type 'void'” by giving each hook an explicit mutation variable type, and fix “implicit any” by typing callback parameters.
