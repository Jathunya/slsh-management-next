import { listThreads } from "@/actions/messages";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const threads = await listThreads();
  return <MessagesClient initialThreads={threads} />;
}
