"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { useUpdateWorkspace } from "../hooks/use-workspaces";

const editWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  imageUrl: z.string().optional().nullable(),
});

type EditWorkspaceFormValues = z.infer<typeof editWorkspaceSchema>;

interface EditWorkspaceFormProps {
  workspaceId: string;
  initialValues: {
    name: string;
    imageUrl: string | null;
  };
}

export const EditWorkspaceForm = ({
  workspaceId,
  initialValues,
}: EditWorkspaceFormProps) => {
  const updateWorkspace = useUpdateWorkspace();

  const form = useForm<EditWorkspaceFormValues>({
    resolver: zodResolver(editWorkspaceSchema),
    defaultValues: {
      name: initialValues.name,
      imageUrl: initialValues.imageUrl ?? undefined,
    },
  });

  const onSubmit = (values: EditWorkspaceFormValues) => {
    const imageUrl = values.imageUrl === "" ? null : values.imageUrl;
    updateWorkspace.mutate({
      id: workspaceId,
      name: values.name,
      imageUrl,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  fallback={form.watch("name")?.[0]?.toUpperCase() || "W"}
                  disabled={updateWorkspace.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter location name"
                  disabled={updateWorkspace.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* // TODO: Add address field with map component */}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateWorkspace.isPending}>
            {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
