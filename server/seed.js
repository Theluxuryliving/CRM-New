const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create CCO
  const cco = await prisma.user.upsert({
    where: { email: 'cco@example.com' },
    update: {},
    create: {
      name: 'Atif Zubair',
      email: 'cco@example.com',
      password: await bcrypt.hash('9731', 10),
      role: 'CCO'
    }
  });

  // Create 3 Directors
  const directorData = [
    { name: 'Talha Ali', email: 'talha@example.com' },
    { name: 'Talal Younas', email: 'talal@example.com' },
    { name: 'Atif Aziz', email: 'aziz@example.com' }
  ];

  const directors = [];

  for (const dir of directorData) {
    const user = await prisma.user.upsert({
      where: { email: dir.email },
      update: {},
      create: {
        name: dir.name,
        email: dir.email,
        password: await bcrypt.hash('1234', 10),
        role: 'DIRECTOR',
        ccoId: cco.id
      }
    });
    directors.push(user);
  }

  for (const director of directors) {
    const team = await prisma.team.upsert({
      where: { name: `Team-${director.name.replace(' ', '')}` },
      update: {},
      create: { name: `Team-${director.name.replace(' ', '')}` }
    });

    const srManager = await prisma.user.upsert({
      where: { email: `${director.name.split(' ')[0].toLowerCase()}_srmanager@example.com` },
      update: {},
      create: {
        name: `Sr Manager of ${director.name}`,
        email: `${director.name.split(' ')[0].toLowerCase()}_srmanager@example.com`,
        password: await bcrypt.hash('1234', 10),
        role: 'SR_MANAGER',
        directorId: director.id,
        ccoId: cco.id
      }
    });

    for (let i = 1; i <= 2; i++) {
      const managerEmail = `${director.name.split(' ')[0].toLowerCase()}_manager${i}@example.com`;
      const manager = await prisma.user.upsert({
        where: { email: managerEmail },
        update: {},
        create: {
          name: `Manager ${i} of ${director.name}`,
          email: managerEmail,
          password: await bcrypt.hash('1234', 10),
          role: 'MANAGER',
          srManagerId: srManager.id,
          directorId: director.id,
          ccoId: cco.id,
          teamId: team.id
        }
      });

      for (let j = 1; j <= 2; j++) {
        const agentEmail = `${director.name.split(' ')[0].toLowerCase()}_manager${i}_agent${j}@example.com`;
        await prisma.user.upsert({
          where: { email: agentEmail },
          update: {},
          create: {
            name: `Agent ${j} of Manager ${i} (${director.name})`,
            email: agentEmail,
            password: await bcrypt.hash('1234', 10),
            role: 'AGENT',
            managerId: manager.id,
            srManagerId: srManager.id,
            directorId: director.id,
            ccoId: cco.id,
            teamId: team.id
          }
        });
      }
    }
  }

  console.log('✅ All users and teams seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
