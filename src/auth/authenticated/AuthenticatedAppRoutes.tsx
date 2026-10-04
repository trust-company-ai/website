import { Navigate, Route, Routes } from "react-router";
import { OAUTH_CALLBACK_PATH } from "@/auth/oauthReturn";
import { SpaceSessionAutoSignIn } from "@/components/SpaceSessionAutoSignIn";
import { ViktorAutoSignIn } from "@/components/ViktorAutoSignIn";
import { ViktorProductAuthProvider } from "@/lib/viktor-spaces-access/ViktorProductAuthProvider";
import { ContactPage } from "@/pages/ContactPage";
import { EmbedPage } from "@/pages/EmbedPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { SubmitPage } from "@/pages/SubmitPage";
import { ViktorOAuthCallbackPage } from "@/pages/ViktorOAuthCallbackPage";
import { LoginPage, SignupPage } from "@/site/AccountPages";
import { Gate } from "@/site/Gate";
import { HomePage } from "@/site/HomePage";
import { SITE } from "@/lib/constants";
import { LvShell } from "@/lovable/Shell";
import { Index as LvHome } from "@/lovable/Home";
import { About as LvAbout } from "@/lovable/About";
import { Agenda as LvMission } from "@/lovable/Mission";
import { Membership as LvMembership } from "@/lovable/Membership";
import { ReadPage } from "@/site/Library";
import { AskPage, LibraryPage } from "@/site/Pages";
import { SiteShell } from "@/site/SiteShell";
import { SupportPage } from "@/site/SupportPage";

/**
 * The whole site sits behind one shared password (Gate). Behind it, visitors
 * stay anonymous; accounts are optional and only raise the assistant's daily
 * question limit (see convex/limits.ts).
 */
export function AuthenticatedRoutes() {
  return (
    <Routes>
      {SITE === "trustcompanyai" && (
        <Route element={<LvShell />}>
          <Route path="/" element={<LvHome />} />
          <Route path="/home" element={<LvHome />} />
          <Route path="/about" element={<LvAbout />} />
          <Route path="/agenda" element={<LvMission />} />
          <Route path="/membership" element={<LvMembership />} />
        </Route>
      )}
      <Route element={<SiteShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/read/*" element={<ReadPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/review" element={<ReviewPage />} />
          <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route path="/embed" element={<EmbedPage />} />
      {/* Return leg of "Sign in with Viktor" — kept for the template; inert
          because this Space only offers email + password. */}
      <Route path={OAUTH_CALLBACK_PATH} element={<ViktorOAuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AuthenticatedAppRoutes() {
  return (
    <ViktorProductAuthProvider enabled>
      <ViktorAutoSignIn />
      <SpaceSessionAutoSignIn />
      <Gate>
        <AuthenticatedRoutes />
      </Gate>
    </ViktorProductAuthProvider>
  );
}
