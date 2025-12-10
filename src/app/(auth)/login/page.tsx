/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { verifyToken } from "@/src/lib/verifyToken";
import { useLoginMutation } from "@/src/redux/features/auth/authApi";
import {
  selectUser,
  setUser,
  TUser,
} from "@/src/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  SeparatorHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginFormValues = {
  id: string;
  password: string;
};

export default function LoginPage() {
  const user = useAppSelector(selectUser);
  const [login] = useLoginMutation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { id: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");

    try {
      const result = await login(data).unwrap();
      const user = verifyToken(result.data.accessToken) as unknown as TUser;
      console.log("user :>> ", user);
      dispatch(setUser({ user: user, token: result.data.accessToken }));
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      console.log("login error :>> ", err);
      toast.error(err?.data?.message || "Login failed");
      setError(err?.data?.message || "Login failed");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <FolderKanban className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ID Field */}
          <div className="space-y-2">
            <Label htmlFor="id">Member ID</Label>
            <Input
              id="id"
              type="text"
              placeholder="Enter your ID (e.g. A-0001)"
              {...register("id", { required: "ID is required" })}
              disabled={isSubmitting}
            />
            {errors.id && (
              <p className="text-red-500 text-sm">{errors.id.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Demo */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm mb-4">
            <p className="font-medium text-foreground">
              Demo Credentials For User:
            </p>
            <p className="text-muted-foreground">ID: M-0002</p>
            <p className="text-muted-foreground">Password: M1234567</p>
            <div className="border-b my-2"></div>
            <p className="font-medium text-foreground">
              Demo Credentials For Admin:
            </p>
            <p className="text-muted-foreground">ID: A-0001</p>
            <p className="text-muted-foreground">Password: 12345</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
