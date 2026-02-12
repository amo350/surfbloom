"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import z from "zod";
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
import { authClient } from "@/lib/auth-client";
import { AuthProvider } from "./AuthContext";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Required"),
});

type LoginProps = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const form = useForm<LoginProps>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginProps) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/index/locations",
      },
      {
        onSuccess: () => {
          router.push("/index/locations");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <AuthProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <div className="text-center mb-1">
              <h2 className="text-3xl font-bold mb-2 text-black/60">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">Login or Create Account</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full shadow-md"
                type="button"
                disabled={isPending}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Login with Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder=""
                        className="shadow-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder=""
                        className="shadow-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full shadow-md"
                disabled={isPending}
              >
                Login
              </Button>
            </div>
            <div className="text-center text-sm">
              No account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-4 text-primary"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </AuthProvider>
  );
};

export default LoginForm;
