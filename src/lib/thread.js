export async function threadFor(prisma, unitId) {
  const existing = await prisma.thread.findUnique({ where: { unitId } });
  if (existing) return existing.id;
  const created = await prisma.thread.create({ data: { unitId } });
  return created.id;
}
