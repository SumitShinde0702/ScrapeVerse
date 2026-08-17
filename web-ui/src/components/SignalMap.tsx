"use client";

import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import type { MaintainerSignal } from "@/lib/api";

export function SignalMap({ signals }: { signals: MaintainerSignal[] }) {
  const { nodes, edges } = useMemo(() => {
    const pkgs = [...new Set(signals.map((s) => s.package_name))];
    const nodes: Node[] = [
      {
        id: "repo",
        position: { x: 0, y: 120 },
        data: { label: "manifest" },
        style: nodeStyle("#7eb6ff"),
      },
      ...pkgs.map((name, i) => ({
        id: `pkg-${name}`,
        position: { x: 220, y: i * 90 },
        data: { label: name },
        style: nodeStyle("#e8eefc"),
      })),
      ...signals.map((s, i) => ({
        id: `sig-${s.source}-${s.package_name}-${i}`,
        position: { x: 460, y: i * 70 },
        data: {
          label: `${s.source} · ${s.latest_version}${s.signal_tags.length ? ` · ${s.signal_tags.join(",")}` : ""}`,
        },
        style: nodeStyle(
          s.signal_tags.includes("security")
            ? "#ff5c7a"
            : s.source === "chaos"
              ? "#ff9a3d"
              : "#3dff9a",
        ),
      })),
    ];

    const edges: Edge[] = [
      ...pkgs.map((name) => ({
        id: `e-repo-${name}`,
        source: "repo",
        target: `pkg-${name}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#243152" },
      })),
      ...signals.map((s, i) => ({
        id: `e-pkg-${s.package_name}-${i}`,
        source: `pkg-${s.package_name}`,
        target: `sig-${s.source}-${s.package_name}-${i}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#3dff9a55" },
      })),
    ];

    return { nodes, edges };
  }, [signals]);

  if (!signals.length) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] text-sm text-[var(--muted)]">
        Run an audit to populate the signal map.
      </div>
    );
  }

  return (
    <div className="h-[360px] overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1020]">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background color="#243152" gap={18} />
        <MiniMap
          style={{ background: "#0f1628" }}
          maskColor="rgba(7,11,20,0.7)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function nodeStyle(color: string) {
  return {
    background: "#121a2f",
    color,
    border: `1px solid ${color}55`,
    borderRadius: 10,
    fontSize: 12,
    padding: 8,
    width: 180,
  };
}
