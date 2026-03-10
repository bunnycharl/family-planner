import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedBudget } from "./seed-budget";

const prisma = new PrismaClient();

async function main() {
  // Ensure default family exists
  const defaultFamily = await prisma.family.upsert({
    where: { id: "default-family-id" },
    update: {},
    create: { id: "default-family-id", name: "Наша семья" },
  });

  // Users are configured via environment variables
  const users = [
    {
      email: process.env.SEED_USER1_EMAIL,
      name: process.env.SEED_USER1_NAME,
      password: process.env.SEED_USER1_PASSWORD,
      avatarColor: "#6366f1",
    },
    {
      email: process.env.SEED_USER2_EMAIL,
      name: process.env.SEED_USER2_NAME,
      password: process.env.SEED_USER2_PASSWORD,
      avatarColor: "#ec4899",
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    if (!userData.email || !userData.name || !userData.password) {
      console.log(`Skipping user: missing env vars`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { hashedPassword },
      create: {
        name: userData.name,
        email: userData.email,
        hashedPassword,
        avatarColor: userData.avatarColor,
        familyId: defaultFamily.id,
      },
    });
    createdUsers.push(user);
  }

  const categories = [
    { name: "Путешествия", color: "#3b82f6", icon: "plane" },
    { name: "Финансы", color: "#22c55e", icon: "wallet" },
    { name: "Важные даты", color: "#ef4444", icon: "heart" },
    { name: "Быт", color: "#6b7280", icon: "home" },
    { name: "Здоровье", color: "#ec4899", icon: "activity" },
    { name: "Дом", color: "#f97316", icon: "wrench" },
    { name: "Работа", color: "#8b5cf6", icon: "briefcase" },
    { name: "Иммиграция", color: "#06b6d4", icon: "globe" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name_familyId: { name: cat.name, familyId: defaultFamily.id } },
      update: {},
      create: { ...cat, familyId: defaultFamily.id },
    });
  }

  // Budget seed
  await seedBudget(prisma);

  console.log("Seed completed:");
  console.log(
    `  Users: ${createdUsers.map((u) => u.name).join(", ") || "none (set SEED_USER* env vars)"}`
  );
  console.log(`  Categories: ${categories.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
