# Workflow Execution Engine Spec

This document defines how `workflows/execute.workflow` runs a workflow at runtime.

Applies to:
- `src/inngest/functions.ts`
- `src/inngest/execution-graph.ts`

## Event Contract

Workflow execution starts from an Inngest event with:
- `workflowId: string` (required)
- `initialData?: Record<string, unknown>` (optional)

Common trigger metadata in `initialData`:
- `_trigger.type: string`
- `_trigger.depth: number`
- `_trigger.firedAt: string`

## Execution Record Lifecycle

Execution rows are persisted in `Execution`:

1. **Create**
   - `status = RUNNING`
   - `workflowId`, `inngestEventId`
   - `triggerType` from `_trigger.type` (fallback `MANUAL_TRIGGER`)
   - `triggerDepth` from `_trigger.depth` (fallback `0`)

2. **During run**
   - `currentNodeId` updated before each node executes
   - wait nodes set:
     - `status = WAITING`
     - `waitingAtNodeId`
     - `nextStepAt`

3. **Resume after wait**
   - `status = RUNNING`
   - clears `waitingAtNodeId`, `nextStepAt`

4. **Complete**
   - `status = SUCCESS`
   - `completeAt`
   - `output` (final context)
   - clears `currentNodeId`, `waitingAtNodeId`, `nextStepAt`

5. **Fail**
   - `status = FAILED`
   - `error`, `errorStack`, `completeAt`
   - clears `currentNodeId`, `waitingAtNodeId`, `nextStepAt`

## Graph Model

Connections are modeled as:
- `fromNodeId`
- `toNodeId`
- `fromOutput` (branch handle, default `"main"`)
- `toInput` (target handle, default `"main"`)

Runtime graph helpers:
- `buildAdjacencyMap(connections)`
- `findEntryNode(nodes, connections)`
- `getNextNodeIds(adjacency, currentNodeId, branch?)`
- `buildNodeMap(nodes)`

Adjacency format:
- `Map<nodeId, Map<fromOutput, nodeId[]>>`

## Entry Node Selection

Entry node is:
1. Node(s) with no incoming edges.
2. If multiple, prefer trigger-like node types.
3. If none, fallback to first node in list.

## Executor Contract

All executors implement:

`(params: NodeExecutorParams) => Promise<WorkflowContext>`

They receive:
- `data` (node config)
- `nodeId`
- `context`
- `step`
- `publish`

They return updated `context`.

### Control Keys (engine-reserved)

Executors may set these temporary control keys on context:

- `_branch: string`
  - If set, engine follows only `fromOutput == _branch`
  - If absent, engine follows `fromOutput == "main"`
  - Engine deletes `_branch` after reading it

- `_wait: { seconds: number; label?: string }`
  - Engine marks execution `WAITING`, sleeps `seconds`, resumes `RUNNING`
  - Engine deletes `_wait` after reading it

- `_waitUntil: { timestamp: string; label?: string }`
  - Engine marks execution `WAITING`, sleeps until timestamp, resumes `RUNNING`
  - Engine deletes `_waitUntil` after reading it

Reserved keys should not be used for business payload fields.

## Trigger Depth Contract

`_trigger.depth` is used for recursion/cycle prevention across workflow-triggered workflows.

- Dispatcher increments depth when firing child workflows.
- Dispatcher skips if depth reaches configured threshold (currently `>= 3`).
- Execution persists current depth in `Execution.triggerDepth`.

## Runtime Safety Limits

- `MAX_NODES_PER_EXECUTION = 50`
  - Exceeding limit fails execution to prevent runaway flows.

## Current Known Limitation

Queue + visited traversal supports:
- linear flows
- branching paths

But can mis-order fan-in/merge patterns if a downstream node expects multiple upstream branches to complete before execution.

If fan-in semantics are required, add predecessor-readiness gating before executing a node.

## Compatibility Notes

- Existing non-branch executors continue to work unchanged.
- Workflows using only `"main"` connections preserve behavior.
- `topologicalSort` in `src/inngest/utils.ts` remains for backward compatibility, but execution now uses graph walk logic.
