"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, MessageSquareHeart, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWorkspace } from "../hooks/use-workspaces";

const editWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  imageUrl: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  paymentLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  feedbackSlug: z.string().optional().nullable(),
  googleReviewUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  feedbackHeading: z.string().optional().nullable(),
  feedbackMessage: z.string().optional().nullable(),
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
    phone: string | null;
    description: string | null;
    paymentLink: string | null;
    feedbackSlug: string | null;
    googleReviewUrl: string | null;
    feedbackHeading: string | null;
    feedbackMessage: string | null;
  };
  smsNumber?: string | null;
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
  smsNumber,
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
      phone: initialValues.phone ?? "",
      description: initialValues.description ?? "",
      paymentLink: initialValues.paymentLink ?? "",
      feedbackSlug: initialValues.feedbackSlug ?? "",
      googleReviewUrl: initialValues.googleReviewUrl ?? "",
      feedbackHeading: initialValues.feedbackHeading ?? "",
      feedbackMessage: initialValues.feedbackMessage ?? "",
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
      phone: values.phone || null,
      description: values.description || null,
      paymentLink: values.paymentLink || null,
      feedbackSlug: values.feedbackSlug || null,
      googleReviewUrl: values.googleReviewUrl || null,
      feedbackHeading: values.feedbackHeading || null,
      feedbackMessage: values.feedbackMessage || null,
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

        {/* Phone Numbers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Phone</span>
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Phone</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Your main contact number. The chatbot shares this with customers.
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="(555) 123-4567"
                    disabled={updateWorkspace.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Twilio SMS Number — read only */}
          {smsNumber ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SMS Number</label>
              <p className="text-xs text-muted-foreground">
                This number sends and receives text messages. Managed in Integrations.
              </p>
              <div className="flex items-center gap-2 h-9 rounded-lg border border-input bg-muted/30 px-3">
                <span className="text-sm font-mono">{smsNumber}</span>
                <span className="ml-auto text-[10px] text-green-600 font-medium">SMS Active</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">SMS Number</label>
              <p className="text-xs text-muted-foreground">
                No SMS number assigned.{" "}
                <a href="/index/integrations" className="text-teal-600 hover:underline">
                  Set up in Integrations
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Description</FormLabel>
              <p className="text-xs text-muted-foreground">
                Tell the chatbot AI about this location — services, specialties, hours, policies, etc.
              </p>
              <FormControl>
                <textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="We specialize in cosmetic dentistry, open Mon-Fri 9am-5pm, walk-ins welcome..."
                  rows={4}
                  disabled={updateWorkspace.isPending}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none resize-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Link */}
        <FormField
          control={form.control}
          name="paymentLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Portal Link</FormLabel>
              <p className="text-xs text-muted-foreground">
                If customers need to make payments, the chatbot can send this link.
              </p>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://pay.stripe.com/your-business"
                  disabled={updateWorkspace.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Feedback Page */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Feedback Page</span>
          </div>

          <FormField
            control={form.control}
            name="feedbackSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feedback Link</FormLabel>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">
                    {typeof window !== "undefined" ? window.location.origin : ""}/r/
                  </span>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="my-business"
                      disabled={updateWorkspace.isPending}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="googleReviewUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Review Link</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Customers who had a great experience go here. Find yours at{" "}
                  <a
                    href="https://support.google.com/business/answer/7035772"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    Google Business Profile
                  </a>
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="https://g.page/r/your-business/review"
                    disabled={updateWorkspace.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedbackHeading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Heading</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="How was your experience?"
                    disabled={updateWorkspace.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedbackMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtext (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="We value your feedback and would love to hear about your visit."
                    rows={2}
                    disabled={updateWorkspace.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("feedbackSlug") && (
            <div className="rounded-lg bg-muted/30 border px-3 py-2">
              <p className="text-xs text-muted-foreground">Preview link:</p>
              <p className="text-sm font-mono text-teal-600">
                {typeof window !== "undefined" ? window.location.origin : ""}/r/{form.watch("feedbackSlug")}
              </p>
            </div>
          )}
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
                <p className="text-sm">Add an address to see the map preview</p>
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
