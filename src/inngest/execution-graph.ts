import type { Connection, Node } from "@/generated/prisma/client";

/**
 * Adjacency map: nodeId -> Map<fromOutput, nodeId[]>
 */
export type AdjacencyMap = Map<string, Map<string, string[]>>;
export type SerializedAdjacency = Record<string, Record<string, string[]>>;

/**
 * Build adjacency map from connections.
 */
export function buildAdjacencyMap(connections: Connection[]): AdjacencyMap {
  const map: AdjacencyMap = new Map();

  for (const conn of connections) {
    if (!map.has(conn.fromNodeId)) {
      map.set(conn.fromNodeId, new Map());
    }

    const outputs = map.get(conn.fromNodeId)!;
    const output = conn.fromOutput || "main";

    if (!outputs.has(output)) {
      outputs.set(output, []);
    }

    outputs.get(output)!.push(conn.toNodeId);
  }

  return map;
}

/**
 * Find the entry node - node with no incoming edges.
 * If multiple exist, prefer trigger types.
 */
const TRIGGER_TYPES = new Set([
  "CONTACT_CREATED",
  "REVIEW_RECEIVED",
  "SMS_RECEIVED",
  "FEEDBACK_SUBMITTED",
  "STAGE_CHANGED",
  "CATEGORY_ADDED",
  "SURVEY_COMPLETED",
  "KEYWORD_JOINED",
  "TASK_COMPLETED",
  "SCHEDULE",
  "MANUAL_TRIGGER",
  "GOOGLE_FORM_TRIGGER",
  "STRIPE_TRIGGER",
]);

export function findEntryNode(
  nodes: Node[],
  connections: Connection[],
): Node | null {
  const hasIncoming = new Set(connections.map((c) => c.toNodeId));
  const entryNodes = nodes.filter((n) => !hasIncoming.has(n.id));

  if (entryNodes.length === 0) return nodes[0] || null;
  if (entryNodes.length === 1) return entryNodes[0];

  const triggerNode = entryNodes.find((n) => TRIGGER_TYPES.has(n.type));
  return triggerNode || entryNodes[0];
}

/**
 * Kahn's algorithm. Guarantees every node appears after all predecessors.
 */
export function topologicalSort(
  nodes: Node[],
  connections: Connection[],
): Node[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const forward = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    forward.set(node.id, []);
  }

  for (const conn of connections) {
    inDegree.set(conn.toNodeId, (inDegree.get(conn.toNodeId) || 0) + 1);
    forward.get(conn.fromNodeId)?.push(conn.toNodeId);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: Node[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) sorted.push(node);

    for (const nextId of forward.get(id) || []) {
      const newDegree = (inDegree.get(nextId) || 1) - 1;
      inDegree.set(nextId, newDegree);
      if (newDegree === 0) queue.push(nextId);
    }
  }

  if (sorted.length !== nodes.length) {
    const sortedIds = new Set(sorted.map((n) => n.id));
    const missing = nodes.filter((n) => !sortedIds.has(n.id));
    throw new Error(
      `Workflow contains a cycle involving nodes: ${missing
        .map((n) => n.name || n.id)
        .join(", ")}`,
    );
  }

  return sorted;
}

/**
 * Determine next nodes from a current node and optional branch key.
 */
export function getNextNodeIds(
  adjacency: AdjacencyMap,
  currentNodeId: string,
  branch?: string,
): string[] {
  const outputs = adjacency.get(currentNodeId);
  if (!outputs) return [];

  if (branch) {
    return outputs.get(branch) || [];
  }

  // Support editor default handle IDs (`source-1`) and legacy `main`.
  const primary = outputs.get("main") || outputs.get("source-1");
  if (primary) return primary;

  // If only one output exists and no branch was selected, treat it as default.
  if (outputs.size === 1) {
    const first = outputs.values().next().value as string[] | undefined;
    return first || [];
  }

  return [];
}

/**
 * Build node lookup map for O(1) access.
 */
export function buildNodeMap(nodes: Node[]): Map<string, Node> {
  return new Map(nodes.map((n) => [n.id, n]));
}

export function serializeAdjacency(map: AdjacencyMap): SerializedAdjacency {
  const result: SerializedAdjacency = {};
  for (const [nodeId, outputs] of map) {
    result[nodeId] = Object.fromEntries(outputs);
  }
  return result;
}

export function deserializeAdjacency(obj: SerializedAdjacency): AdjacencyMap {
  const map = new Map<string, Map<string, string[]>>();
  for (const [nodeId, outputs] of Object.entries(obj)) {
    map.set(nodeId, new Map(Object.entries(outputs)));
  }
  return map;
}

export function serializeSortedOrder(sorted: Node[]): string[] {
  return sorted.map((n) => n.id);
}
