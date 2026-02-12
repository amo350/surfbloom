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
import { MapPin } from "lucide-react";

const editWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  imageUrl: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});

type EditWorkspaceFormValues = z.infer<typeof editWorkspaceSchema>;

interface EditWorkspaceFormProps {
  workspaceId: string;
  initialValues: {
    name: string;
    imageUrl: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
}

function buildMapQuery(values: {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}): string | null {
  const parts = [values.address, values.city, values.state, values.zipCode]
    .filter(Boolean)
    .join(", ");

  if (!parts) return null;

  // Prepend business name for better pin accuracy
  const query = values.name ? `${values.name}, ${parts}` : parts;
  return encodeURIComponent(query);
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
      address: initialValues.address ?? "",
      city: initialValues.city ?? "",
      state: initialValues.state ?? "",
      zipCode: initialValues.zipCode ?? "",
    },
  });

  const onSubmit = (values: EditWorkspaceFormValues) => {
    const imageUrl = values.imageUrl === "" ? null : values.imageUrl;

    updateWorkspace.mutate({
      id: workspaceId,
      name: values.name,
      imageUrl,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      zipCode: values.zipCode || null,
    });
  };

  // Watch address fields for live map preview
  const watchedValues = form.watch([
    "name",
    "address",
    "city",
    "state",
    "zipCode",
  ]);
  const mapQuery = buildMapQuery({
    name: watchedValues[0],
    address: watchedValues[1],
    city: watchedValues[2],
    state: watchedValues[3],
    zipCode: watchedValues[4],
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image + Name (existing) */}
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

        {/* Address Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Address</span>
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="123 Main St"
                    disabled={updateWorkspace.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Brooklyn"
                        disabled={updateWorkspace.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="NY"
                        disabled={updateWorkspace.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="11201"
                        disabled={updateWorkspace.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="space-y-2">
          {mapQuery ? (
            <div className="rounded-lg overflow-hidden border">
              <iframe
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                title="Location preview"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed flex items-center justify-center h-[200px] bg-muted/30">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Add an address to see the map preview
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateWorkspace.isPending}>
            {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
