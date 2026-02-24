"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONDITION_PRESETS,
  type ConditionConfig,
  type ConditionOperator,
  OPERATOR_LABELS,
  PRESET_CATEGORIES,
} from "@/features/nodes/logic/lib/condition-presets";

interface IfElseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { condition: ConditionConfig }) => void;
  defaultValues?: { condition?: ConditionConfig };
}

const OPERATORS: ConditionOperator[] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "exists",
  "not_exists",
  "in",
];

const NO_VALUE_OPERATORS: ConditionOperator[] = ["exists", "not_exists"];
const NUMERIC_OPERATORS: ConditionOperator[] = ["gt", "gte", "lt", "lte"];

export function IfElseDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: IfElseDialogProps) {
  const existing = defaultValues?.condition;

  const [presetId, setPresetId] = useState(existing?.preset || "");
  const [field, setField] = useState(existing?.field || "");
  const [operator, setOperator] = useState<ConditionOperator>(
    existing?.operator || "eq",
  );
  const [value, setValue] = useState(existing?.value?.toString() || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPresetId(existing?.preset || "");
      setField(existing?.field || "");
      setOperator(existing?.operator || "eq");
      setValue(existing?.value?.toString() || "");
      setValidationError(null);
    }
  }, [open, existing]);

  const handlePresetChange = (id: string) => {
    setPresetId(id);
    const preset = CONDITION_PRESETS.find((p) => p.id === id);
    if (!preset) return;

    setField(preset.defaults.field);
    setOperator(preset.defaults.operator);
    setValue(preset.defaults.value?.toString() || "");
  };

  const handleSave = () => {
    const trimmedValue = value.trim();
    const isCategoryField = field === "_categories";
    const needsValue =
      isCategoryField || !NO_VALUE_OPERATORS.includes(operator);

    if (needsValue && trimmedValue.length === 0) {
      setValidationError("Value is required for this condition.");
      return;
    }

    const isNumeric = NUMERIC_OPERATORS.includes(operator);
    if (isNumeric) {
      const numericValue = Number(trimmedValue);
      if (trimmedValue.length === 0 || !Number.isFinite(numericValue)) {
        setValidationError("Value must be a valid number for this operator.");
        return;
      }
    }

    const parsedValue = !needsValue
      ? undefined
      : isNumeric
        ? Number(trimmedValue)
        : trimmedValue;

    setValidationError(null);

    onSubmit({
      condition: {
        preset: presetId || undefined,
        field,
        operator,
        value: parsedValue,
      },
    });
    onOpenChange(false);
  };

  const needsValue =
    field === "_categories" || !NO_VALUE_OPERATORS.includes(operator);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>If/Else Condition</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Quick select</Label>
            <Select value={presetId} onValueChange={handlePresetChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Choose a preset or configure manually" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_CATEGORIES.map((category) => {
                  const presets = CONDITION_PRESETS.filter(
                    (preset) => preset.category === category.id,
                  );
                  if (presets.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {category.label}
                      </div>
                      {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Field (context path)</Label>
            <Input
              value={field}
              onChange={(event) => setField(event.target.value)}
              placeholder="e.g. review.rating, contact.stage"
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Dot-path into workflow context. Presets fill this automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Operator</Label>
            <Select
              value={operator}
              onValueChange={(next) => setOperator(next as ConditionOperator)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsValue && (
            <div className="space-y-1.5">
              <Label className="text-xs">Value</Label>
              <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={
                  operator === "in"
                    ? "e.g. hot,warm,new"
                    : "e.g. 4, new_lead, promoter"
                }
                className="h-9"
              />
              {operator === "in" && (
                <p className="text-[10px] text-muted-foreground">
                  Comma-separated list of values
                </p>
              )}
              {validationError && (
                <p className="text-[10px] text-red-500">{validationError}</p>
              )}
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-medium text-muted-foreground">
              Condition preview:
            </p>
            <p className="text-xs font-mono">
              {field || "..."}{" "}
              <span className="text-muted-foreground">
                {OPERATOR_LABELS[operator]}
              </span>{" "}
              {needsValue ? value || "..." : ""}
            </p>
            <div className="mt-2 flex gap-3 text-[10px]">
              <span className="text-emerald-600">
                True {"->"} right top handle
              </span>
              <span className="text-red-400">
                False {"->"} right bottom handle
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={handleSave} disabled={!field}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
