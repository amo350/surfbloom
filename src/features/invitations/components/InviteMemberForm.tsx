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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateInvitation } from "../hooks/use-invitations";
import { MemberRole } from "@/generated/prisma/enums";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(MemberRole),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberFormProps {
  workspaceId: string;
  onSuccess?: () => void;
}

export const InviteMemberForm = ({
  workspaceId,
  onSuccess,
}: InviteMemberFormProps) => {
  const createInvitation = useCreateInvitation();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: MemberRole.MEMBER,
    },
  });

  const onSubmit = (values: InviteFormValues) => {
    createInvitation.mutate(
      {
        workspaceId,
        email: values.email,
        role: values.role,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="colleague@company.com"
                  disabled={createInvitation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={createInvitation.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={MemberRole.MEMBER}>Member</SelectItem>
                  <SelectItem value={MemberRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createInvitation.isPending}
          className="w-full"
        >
          {createInvitation.isPending ? "Sending..." : "Send Invitation"}
        </Button>
      </form>
    </Form>
  );
};
