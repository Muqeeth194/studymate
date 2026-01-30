"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { BookOpenCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { toast } = useToast();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  // Handle Step 1: Create Account
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);

      // Optional: Toast for code sent
      toast({
        title: "Code sent!",
        description: "Please check your email for the verification code.",
        duration: 3000,
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.message || "Something went wrong");
    }
  };

  // Handle Step 2: Verify Email
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });

        toast({
          title: "Success!",
          description: "Your account has been verified successfully.",
          variant: "default",
          duration: 3000,
        });

        router.push("/sign-in");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.message || "Invalid Code");

      // Optional: Error Toast
      toast({
        title: "Verification Failed",
        description: err.errors[0]?.message || "Invalid Code",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 pt-10">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-2xl font-headline mb-4"
      >
        <BookOpenCheck className="h-8 w-8 text-primary" />
        <span>StudyMate AI</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            {pendingVerification ? "Verify Email" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {pendingVerification
              ? "We sent a code to your email. Enter it below."
              : "Enter your details below to create your account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}

          {!pendingVerification ? (
            /* STEP 1: SIGN UP FORM */
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div id="clerk-captcha" />
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            /* STEP 2: VERIFICATION FORM */
            <form onSubmit={handleVerify} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify Account
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          {!pendingVerification && (
            <div className="text-center text-sm text-muted-foreground w-full">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline hover:text-primary">
                Sign in
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
