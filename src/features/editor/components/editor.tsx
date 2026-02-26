"use client";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorView, LoadingView } from "@/components/EntityComponents";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useNodeSelectorHotkey } from "@/features/workflows/hooks/use-node-selector-hotkey";

import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { nodeComponents } from "@/config/node-components";
import { NodeType } from "@/generated/prisma/enums";
import { editorAtom } from "../store/atoms";
import { AddNodeButton } from "./AddNodeButton";
import { ExecuteWorkflowButton } from "./ExecuteWorkflowButton";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};
export const EditorError = () => {
  return <ErrorView message="Error Loading editor..." />;
};

const initialNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Node 1" },
  },
  {
    id: "n2",
    position: { x: 0, y: 100 },
    data: { label: "Node 2" },
  },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export const Editor = ({
  workflowId,
  workspaceId,
}: {
  workflowId: string;
  workspaceId: string;
}) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId, workspaceId);

  const setEditor = useSetAtom(editorAtom);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const previousLeftRef = useRef<number | null>(null);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(
    workflow.edges.map((edge) => ({
      ...edge,
      type: "default",
    })),
  );
  const [selectorOpen, setSelectorOpen] = useState(false);

  const openSelector = useCallback(() => setSelectorOpen(true), []);
  useNodeSelectorHotkey(openSelector);
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      flowRef.current = instance;
      setEditor(instance);
      requestAnimationFrame(() => {
        instance.fitView({ padding: 0.2 });
      });
    },
    [setEditor],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) =>
        addEdge({ ...params, type: "default" }, edgesSnapshot),
      ),
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    previousLeftRef.current = element.getBoundingClientRect().left;

    const observer = new ResizeObserver(() => {
      const flow = flowRef.current;
      if (!flow) return;

      const currentLeft = element.getBoundingClientRect().left;
      const previousLeft = previousLeftRef.current ?? currentLeft;
      const deltaLeft = currentLeft - previousLeft;
      previousLeftRef.current = currentLeft;

      if (Math.abs(deltaLeft) < 0.5) return;

      const viewport = flow.getViewport();
      flow.setViewport(
        {
          x: viewport.x - deltaLeft,
          y: viewport.y,
          zoom: viewport.zoom,
        },
        { duration: 0 },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        proOptions={{ hideAttribution: true }}
        onInit={handleInit}
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background bgColor="#ffffff" />
        <Controls />
        <MiniMap style={{ width: 100, height: 75 }} />
        <Panel position="top-right">
          <AddNodeButton
            selectorOpen={selectorOpen}
            onSelectorOpenChange={setSelectorOpen}
          />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton
              workflowId={workflowId}
              workspaceId={workspaceId}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
