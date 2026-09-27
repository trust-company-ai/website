import { ChatPanel } from "@/components/chat/ChatPanel";

/** Minimal frame for embedding in the website via <iframe> or widget.js. */
export function EmbedPage() {
  return (
    <div className="h-screen w-screen bg-transparent p-2">
      <ChatPanel compact />
    </div>
  );
}
