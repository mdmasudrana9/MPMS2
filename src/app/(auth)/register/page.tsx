"use client";

import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { RegisterFormValues } from "@/src/lib/types";
import { useCreateMemberMutation } from "@/src/redux/features/auth/authApi";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [createMember] = useCreateMemberMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      id: "",
      email: "",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  // const confirmPassword = watch("confirmPassword");

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
  ];
  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const onSubmit = async (data: RegisterFormValues) => {
    console.log("data :>> ", data);
    setError("");

    if (!allRequirementsMet) {
      setError("Password does not meet requirements");
      return;
    }

    const userInfo = {
      member: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
      },
    };

    try {
      const response = await createMember(userInfo).unwrap();

      toast.success("Registration successful!");

      router.push("/dashboard");
    } catch (err: any) {
      console.log("Register Error ⇒", err);

      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <FolderKanban className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        {/* <CardDescription>Enter your details to get started</CardDescription> */}
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
              })}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              type="text"
              placeholder="Enter your ID"
              {...register("id", {
                required: "ID is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
              })}
              disabled={isSubmitting}
            />
            {errors.id && (
              <p className="text-red-500 text-xs">{errors.id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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
            {password && (
              <ul className="mt-2 space-y-1 text-xs ">
                {passwordRequirements.map((req) => (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 ${
                      req.met ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-3 w-3 ${
                        req.met ? "text-green-600" : "text-muted-foreground"
                      }`}
                    />
                    {req.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* <div className="space-y-2 mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
              disabled={isSubmitting}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div> */}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
