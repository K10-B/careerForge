"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <CardDescription>Launch your AI-powered job search system in under a minute.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setErrors({});

            startTransition(async () => {
              try {
                const response = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();
                if (!response.ok) {
                  if (data.field && typeof data.field === "string") {
                    setErrors({ [data.field]: data.error ?? "Please check this field." });
                  } else {
                    setErrors({ form: data.error ?? "Unable to create your account." });
                  }
                  return;
                }

                const signInResult = await signIn("credentials", { email, password, redirect: false });
                if (signInResult?.error) {
                  setErrors({ form: signInResult.error });
                  return;
                }

                router.push("/dashboard");
                router.refresh();
              } catch {
                setErrors({
                  form: "We could not reach the server. Make sure the app is running and try again.",
                });
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} required />
            {errors.name ? <p className="text-sm text-rose-500">{errors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {errors.email ? <p className="text-sm text-rose-500">{errors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            {errors.password ? <p className="text-sm text-rose-500">{errors.password}</p> : null}
          </div>
          {errors.form ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/8 p-3 text-sm text-rose-500">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errors.form}</p>
            </div>
          ) : null}
          <Button className="w-full" type="submit" variant="accent" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start free"}
          </Button>
          <Button asChild className="w-full" type="button" variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

