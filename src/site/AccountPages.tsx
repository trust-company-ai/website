import { useConvexAuth } from "convex/react";
import { Link, Navigate } from "react-router";
import { SignIn } from "@/components/SignIn";
import { SignUp } from "@/components/SignUp";
import { Page } from "@/site/SiteShell";

/** Sign-in / sign-up in the site's own look. Signed-in visitors go to /ask. */
function AccountPage({ mode }: { mode: "login" | "signup" }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return <div className="flex-1" />;
  if (isAuthenticated) return <Navigate to="/ask" replace />;
  const login = mode === "login";
  return (
    <Page
      title={login ? "Sign in" : "Create an account"}
    >
      <div className="max-w-sm space-y-6 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:bg-secondary [&_[data-slot=card]]:bg-none [&_[data-slot=card]]:rounded-2xl">
        {login ? <SignIn /> : <SignUp />}
        <p className="text-sm text-muted-foreground">
          {login ? (
            <>
              No account yet?{" "}
              <Link to="/signup" className="underline text-foreground">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have one?{" "}
              <Link to="/login" className="underline text-foreground">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </Page>
  );
}

export function LoginPage() {
  return <AccountPage mode="login" />;
}
export function SignupPage() {
  return <AccountPage mode="signup" />;
}
