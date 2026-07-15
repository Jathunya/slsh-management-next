"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { threadFor } from "@/lib/thread";
import { revalidatePath } from "next/cache";

const messageSchema = z.object({
  unitId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

export async function sendMessage(input) {
  const session = await requireSession();
  const data = messageSchema.parse(input);

  if (session.user.role !== "ADMIN" && session.user.unitId !== data.unitId) {
    throw new Error("Unauthorized");
  }

  const threadId = await threadFor(prisma, data.unitId);
  const message = await prisma.message.create({
    data: { threadId, senderId: session.user.id, body: data.body },
  });
  await prisma.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  if (session.user.role === "ADMIN") {
    const residents = await prisma.user.findMany({
      where: { unitId: data.unitId, role: "RESIDENT" },
    });
    if (residents.length > 0) {
      await prisma.notification.createMany({
        data: residents.map((u) => ({
          userId: u.id,
          kind: "MESSAGE",
          body: "New message from building admin.",
        })),
      });
    }
  } else {
    const unit = await prisma.unit.findUnique({ where: { id: data.unitId } });
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((u) => ({
          userId: u.id,
          kind: "MESSAGE",
          body: `New message from unit ${unit?.number ?? ""}.`,
        })),
      });
    }
  }

  revalidatePath("/messages");
  revalidatePath("/my-parcels");
  revalidatePath("/bills");
  revalidatePath("/profile");
  return message;
}

export async function markThreadRead(threadId) {
  const session = await requireSession();
  await prisma.message.updateMany({
    where: { threadId, senderId: { not: session.user.id }, status: "SENT" },
    data: { status: "READ" },
  });
  revalidatePath("/messages");
}

export async function getUnreadThreadCount() {
  const session = await requireSession();
  const unread = await prisma.message.findMany({
    where: { senderId: { not: session.user.id }, status: "SENT" },
    select: { threadId: true },
    distinct: ["threadId"],
  });
  return unread.length;
}

export async function getMyThread() {
  const session = await requireSession();
  if (!session.user.unitId) return { unitId: null, messages: [] };

  const threadId = await threadFor(prisma, session.user.unitId);
  const messages = await prisma.message.findMany({
    where: { threadId },
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  return { unitId: session.user.unitId, threadId, messages };
}

export async function listThreads() {
  await requireSession();
  const threads = await prisma.thread.findMany({
    include: {
      unit: { select: { number: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return threads;
}

export async function getThreadMessages(threadId) {
  await requireSession();
  const messages = await prisma.message.findMany({
    where: { threadId },
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  return messages;
}
