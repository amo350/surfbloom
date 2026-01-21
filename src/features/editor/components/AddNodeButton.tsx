'use client'

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo } from "react"

export const AddNodeButton = memo(() => {
    return (
        <Button
            onClick={() => { }}
            size="icon"
            variant="outline"
            className="bg-background"
            aria-label="Add new node"
        >
            <PlusIcon className="h-4 w-4" />
        </Button>
    );
});

AddNodeButton.displayName = "AddNodeButton";