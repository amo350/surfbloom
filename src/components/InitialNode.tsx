'useClient'

import type { NodeProps } from "@xyflow/react"
import { PlusIcon } from "lucide-react"
import { memo } from 'react'
import { PlaceholderNode } from "./react-flow/placeholder-node"
import { WorkflowNode } from "./WorkflowNode"

export const InitialNode = memo((props: NodeProps) => {
    return (
        <WorkflowNode showToolbar={false}>
            <PlaceholderNode {...props}
                onClick={() => { }}
            >
                <div className="cursor-pointer flex items-center justify-center">
                    <PlusIcon />
                </div>
            </PlaceholderNode>
        </WorkflowNode>

    )
})