import { ConvexProvider } from "convex/react";
import { Navigate, Route, Routes } from "react-router";
import { convex } from "@/auth/convexClient";
import { ContactPage } from "@/pages/ContactPage";
import { EmbedPage } from "@/pages/EmbedPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { SubmitPage } from "@/pages/SubmitPage";
import { HomePage } from "@/site/HomePage";
import { ReadPage } from "@/site/Library";
import { AskPage, LibraryPage } from "@/site/Pages";
import { SiteShell } from "@/site/SiteShell";
import { SupportPage } from "@/site/SupportPage";

export function PublicAppRoutes() {
  return (
    <ConvexProvider client={convex}>
      <Routes>
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
        </Route>
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConvexProvider>
  );
}
