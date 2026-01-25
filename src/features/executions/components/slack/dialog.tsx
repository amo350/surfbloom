"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and container only letters, numbers, and underscores",
    }),
  username: z.string().optional(),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(500, "Slack messages cannot exceed 500 characters"),
  webhookUrl: z.string().min(1, "Webhook URL is required")
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      username: defaultValues?.username || "",
      content: defaultValues?.content || "",
      webhookUrl: defaultValues?.webhookUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
      variableName: defaultValues.variableName || "",
      username: defaultValues?.username || "",
      content: defaultValues?.content || "",
      webhookUrl: defaultValues?.webhookUrl || "",
      });
    }
  }, [open, defaultValues, form]);
  const watchVariableName = form.watch("variableName") || "mySlack";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Slack</DialogTitle>
          <DialogDescription>Configure Slack Webhook</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="mySlack" 
                      className="rounded-2xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Reference result to differentiate from other nodes:{" "}
                    <span className="font-mono text-xs">
                      {`{{${watchVariableName}.status}}`}
                    </span>
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://hooks.slack.com/services/..." 
                      className="rounded-2xl font-mono text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your Slack incoming webhook URL
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello from workflow! {{json data}}"
                      className="min-h-[120px] rounded-2xl font-mono text-sm"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Message to send to Slack. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                  </FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit" className="rounded-2xl">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
