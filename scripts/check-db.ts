import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== MESSAGE LOGS ===');
  const logs = await prisma.messageLog.findMany({ 
    take: 5, 
    orderBy: { createdAt: 'desc' } 
  });
  logs.forEach(l => {
    console.log(`- ${l.recipientPhone} | ${l.templateName} | ${l.status} | ${l.messageId?.slice(0,30)}...`);
  });

  console.log('\n=== MESSAGE EVENTS (Webhooks) ===');
  const events = await prisma.messageEvent.findMany({ 
    take: 5, 
    orderBy: { timestamp: 'desc' } 
  });
  if (events.length === 0) {
    console.log('No webhook events received yet');
  } else {
    events.forEach(e => {
      console.log(`- ${e.recipientPhone} | ${e.status} | ${e.waMessageId?.slice(0,30)}...`);
    });
  }

  await prisma.$disconnect();
}

main();
