import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/log-in/login-form";

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-8">
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-xl mx-auto">
            <Image src="/logo.png" alt="Logo" width={64} height={64} />
          </div>
          <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm font-sans">
            Log in to your Linkora dashboard
          </p>
        </div>
        <Suspense fallback={<LoginPageFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
