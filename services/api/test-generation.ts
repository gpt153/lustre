import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test that types exist
async function test() {
  // These should compile if types were generated
  const swipeType: typeof prisma.swipe;
  const matchType: typeof prisma.match;
  const seenProfileType: typeof prisma.seenProfile;
  
  console.log("Generation successful - all models available");
}

test();
