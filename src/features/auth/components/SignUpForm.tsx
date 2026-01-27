"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Form, FormMessage } from "@/components/ui/form";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { AuthProvider } from "./AuthContext";

const signUpSchema = z
  .object({
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword", "password"],
  });

type SignUpProps = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<SignUpProps>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpProps) => {
    await authClient.signUp.email(
      {
        name: values.email,
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
    <>
      <AuthProvider title="Get Started" subtitle="Create Account or Login">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="text-center mb-1">
                <h2 className="text-3xl font-bold mb-2 text-black/60">
                  Get Started
                </h2>
                <p className="text-muted-foreground">Create Account or Login</p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full shadow-md"
                  type="button"
                  disabled={isPending}
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Continue with Google
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
                  variant="secondary"
                  className="w-full shadow-md"
                  disabled={isPending}
                >
                  Create Account
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 text-primary"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </AuthProvider>
      <div className="auth-footer w-full max-w-[30.8rem] mt-6 space-y-2 mx-auto">
        <p className="text-xs text-center text-muted-foreground/70">
          By clicking "Create Account" above, you acknowledge that you have read
          and understood, and agree to SurfBloom's{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Notice
          </Link>
          .
        </p>
      </div>
    </>
  );
};

export default SignUpForm;
