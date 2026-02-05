import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password1 = await bcrypt.hash("2403", 10);
  const password2 = await bcrypt.hash("0880", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "nkudryawov" },
    update: { hashedPassword: password1 },
    create: {
      name: "Никита",
      email: "nkudryawov",
      hashedPassword: password1,
      avatarColor: "#6366f1",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "allodasha" },
    update: { hashedPassword: password2 },
    create: {
      name: "Даша",
      email: "allodasha",
      hashedPassword: password2,
      avatarColor: "#ec4899",
    },
  });

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
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Seed completed:");
  console.log(`  Users: ${user1.name}, ${user2.name}`);
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
