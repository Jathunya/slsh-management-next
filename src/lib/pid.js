export async function generateParcelId(prisma) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const last = await prisma.parcel.findFirst({
    where: { pid: { startsWith: mm } },
    orderBy: { pid: "desc" },
  });

  const lastSeq = last ? parseInt(last.pid.slice(mm.length), 10) : 0;
  const seq = String(lastSeq + 1).padStart(4, "0");
  return `${mm}${seq}`;
}
