"use client";

import { use } from "react";

import ChatContainer from "@/components/chat/chat-container";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);

  return (
    <div className="h-full">
      <ChatContainer sessionId={sessionId} />
    </div>
  );
}
