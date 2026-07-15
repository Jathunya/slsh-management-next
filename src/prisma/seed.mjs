import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Passw0rd!";

const UNITS = [
  { number: "2B", floor: 2, occupancy: "OWNER" },
  { number: "3A", floor: 3, occupancy: "TENANT" },
  { number: "4B", floor: 4, occupancy: "OWNER" },
  { number: "4C", floor: 4, occupancy: "TENANT" },
  { number: "5A", floor: 5, occupancy: "OWNER" },
  { number: "5B", floor: 5, occupancy: "TENANT" },
];

const RESIDENTS = [
  { name: "Nattapong Chai", email: "nattapong@slsh.dev", phone: "081-234-5671" },
  { name: "Suda Wongsawat", email: "suda@slsh.dev", phone: "081-234-5672" },
  { name: "Kittipong Boon", email: "kittipong@slsh.dev", phone: "081-234-5673" },
  { name: "Pim Srisuk", email: "pim@slsh.dev", phone: "081-234-5674" },
  { name: "Anan Thepwong", email: "anan@slsh.dev", phone: "081-234-5675" },
  { name: "Waraporn Jai", email: "waraporn@slsh.dev", phone: "081-234-5676" },
];

const CARRIERS = ["KERRY", "FLASH", "JT", "THAI_POST"];
const TYPES = ["BOX", "WRAP", "DOCUMENT"];
const SIZES = ["S", "M", "L", "XL"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomParcelTypeSize() {
  const type = randomFrom(TYPES);
  const eligibleSizes = type === "DOCUMENT" ? SIZES.filter((s) => s !== "XL") : SIZES;
  return { type, size: randomFrom(eligibleSizes) };
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();

  const units = [];
  for (const u of UNITS) {
    const unit = await prisma.unit.create({
      data: {
        number: u.number,
        floor: u.floor,
        occupancy: u.occupancy,
        contractStart: new Date(2025, 0, 1),
        contractEnd: new Date(2027, 0, 1),
      },
    });
    units.push(unit);
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@slsh.dev",
      passwordHash,
      name: "Building Admin",
      role: "ADMIN",
      phone: "02-000-1111",
    },
  });

  const residents = [];
  for (let i = 0; i < RESIDENTS.length; i++) {
    const r = RESIDENTS[i];
    const unit = units[i];
    const resident = await prisma.user.create({
      data: {
        email: r.email,
        passwordHash,
        name: r.name,
        role: "RESIDENT",
        phone: r.phone,
        unitId: unit.id,
      },
    });
    residents.push(resident);

    await prisma.vehicle.create({
      data: { unitId: unit.id, plate: `${1000 + i}-กข-${10 + i}` },
    });
  }

  // Parcels: ~20 total, mostly DELIVERED, one guaranteed PENDING per unit
  let parcelCounter = 1;
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const recipient = residents[i];

    // one guaranteed pending parcel per unit
    const pendingTypeSize = randomParcelTypeSize();
    await prisma.parcel.create({
      data: {
        pid: `${mm}${String(parcelCounter++).padStart(4, "0")}`,
        tracking: `TH${Math.floor(100000000 + Math.random() * 899999999)}`,
        carrier: randomFrom(CARRIERS),
        type: pendingTypeSize.type,
        size: pendingTypeSize.size,
        status: "PENDING",
        unitId: unit.id,
        recipientId: recipient.id,
        checkInAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    });

    // 2-3 delivered parcels of history per unit
    const historyCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < historyCount; j++) {
      const typeSize = randomParcelTypeSize();
      const checkInAt = new Date(now.getTime() - (5 + Math.random() * 30) * 24 * 60 * 60 * 1000);
      await prisma.parcel.create({
        data: {
          pid: `${mm}${String(parcelCounter++).padStart(4, "0")}`,
          tracking: `TH${Math.floor(100000000 + Math.random() * 899999999)}`,
          carrier: randomFrom(CARRIERS),
          type: typeSize.type,
          size: typeSize.size,
          status: "DELIVERED",
          unitId: unit.id,
          recipientId: recipient.id,
          checkInAt,
          checkOutAt: new Date(checkInAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Bills: 2 current-period per unit (WATER + ELECTRIC), half paid, plus a couple historical paid
  const currentPeriod = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastPeriod = lastMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const isPaid = i % 2 === 0;

    const waterBill = await prisma.bill.create({
      data: {
        unitId: unit.id,
        type: "WATER",
        period: currentPeriod,
        amount: 250 + Math.floor(Math.random() * 150),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
        status: isPaid ? "PAID" : "UNPAID",
        paidAt: isPaid ? new Date() : null,
      },
    });
    if (isPaid) {
      await prisma.payment.create({
        data: { billId: waterBill.id, amount: waterBill.amount, method: "QR" },
      });
    }

    const electricBill = await prisma.bill.create({
      data: {
        unitId: unit.id,
        type: "ELECTRIC",
        period: currentPeriod,
        amount: 800 + Math.floor(Math.random() * 600),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
        status: !isPaid ? "PAID" : "UNPAID",
        paidAt: !isPaid ? new Date() : null,
      },
    });
    if (!isPaid) {
      await prisma.payment.create({
        data: { billId: electricBill.id, amount: electricBill.amount, method: "TRANSFER" },
      });
    }

    // historical paid bill from last month
    const oldBill = await prisma.bill.create({
      data: {
        unitId: unit.id,
        type: i % 2 === 0 ? "WATER" : "ELECTRIC",
        period: lastPeriod,
        amount: 400 + Math.floor(Math.random() * 300),
        dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28),
        status: "PAID",
        paidAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 20),
      },
    });
    await prisma.payment.create({
      data: {
        billId: oldBill.id,
        amount: oldBill.amount,
        method: "QR",
        paidAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 20),
      },
    });
  }

  // Threads + messages, one thread per unit
  const messageTemplates = [
    { from: "resident", body: "Hi, just checking if any parcels arrived for me this week?" },
    { from: "admin", body: "Hello! Yes, you have a package waiting at the front desk." },
    { from: "resident", body: "Great, thank you! I'll pick it up this evening." },
    { from: "admin", body: "Sounds good, we're open until 9pm." },
    { from: "resident", body: "Also, is this month's water bill posted yet?" },
  ];

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const resident = residents[i];

    const thread = await prisma.thread.create({ data: { unitId: unit.id } });

    const msgCount = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < msgCount && j < messageTemplates.length; j++) {
      const tmpl = messageTemplates[j];
      await prisma.message.create({
        data: {
          threadId: thread.id,
          senderId: tmpl.from === "admin" ? admin.id : resident.id,
          body: tmpl.body,
          status: "READ",
          createdAt: new Date(now.getTime() - (msgCount - j) * 60 * 60 * 1000),
        },
      });
    }
  }

  // Assets
  const ASSETS = [
    { serial: "AST-001", name: "Passenger Elevator A", category: "ELEVATOR", location: "Main Lobby", value: 850000, condition: "GOOD" },
    { serial: "AST-002", name: "Passenger Elevator B", category: "ELEVATOR", location: "West Wing", value: 850000, condition: "FAIR" },
    { serial: "AST-003", name: "Backup Generator", category: "GENERATOR", location: "Basement", value: 420000, condition: "GOOD" },
    { serial: "AST-004", name: "CCTV System", category: "SECURITY", location: "Building-wide", value: 180000, condition: "GOOD" },
    { serial: "AST-005", name: "Pool Filtration Pump", category: "POOL", location: "Rooftop Pool", value: 65000, condition: "FAIR" },
    { serial: "AST-006", name: "Treadmill Set (x4)", category: "GYM", location: "Fitness Room", value: 240000, condition: "GOOD" },
    { serial: "AST-007", name: "Access Control Gate", category: "SECURITY", location: "Main Entrance", value: 95000, condition: "POOR" },
    { serial: "AST-008", name: "Common Area AC Unit", category: "COMMON", location: "Lobby", value: 120000, condition: "FAIR" },
  ];

  const assets = [];
  for (const a of ASSETS) {
    const asset = await prisma.asset.create({ data: a });
    assets.push(asset);
  }

  await prisma.maintenanceLog.create({
    data: {
      assetId: assets[6].id,
      note: "Access gate motor replaced after repeated jamming.",
      cost: 8500,
      servicedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.maintenanceLog.create({
    data: {
      assetId: assets[4].id,
      note: "Pump seal replaced, filter cleaned.",
      cost: 3200,
      servicedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.maintenanceLog.create({
    data: {
      assetId: assets[1].id,
      note: "Routine annual inspection, minor cable wear noted.",
      cost: 5000,
      servicedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: residents[0].id,
      kind: "PARCEL_ARRIVED",
      body: "Your parcel has arrived and is pending pickup.",
      read: false,
    },
  });
  await prisma.notification.create({
    data: {
      userId: residents[1].id,
      kind: "BILL_CREATED",
      body: `Your ${currentPeriod} bill is ready.`,
      read: false,
    },
  });
  await prisma.notification.create({
    data: {
      userId: residents[2].id,
      kind: "BILL_PAID",
      body: "Your payment has been received.",
      read: true,
    },
  });
  await prisma.notification.create({
    data: {
      userId: admin.id,
      kind: "MESSAGE",
      body: "New message from unit 3A.",
      read: false,
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: admin@slsh.dev / ${DEMO_PASSWORD}`);
  console.log(`Resident login (e.g.): ${RESIDENTS[0].email} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
