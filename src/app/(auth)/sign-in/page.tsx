import Link from "next/link";

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
import { BookOpenCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center space-y-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl font-headline mb-4">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          <span>StudyVerse AI</span>
        </Link>
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
            <CardDescription>
            Enter your email below to log in to your account.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
                <Link href="/dashboard">Sign In</Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline hover:text-primary">
                    Sign up
                </Link>
            </div>
        </CardFooter>
        </Card>
    </div>
  );
}
