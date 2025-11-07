import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const employeeEmail = process.env.EMPLOYEE_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const employeePassword = process.env.EMPLOYEE_PASSWORD

  if (!adminEmail || !employeeEmail || !adminPassword || !employeePassword) {
    throw new Error(
      'Missing required environment variables (ADMIN_EMAIL, EMPLOYEE_EMAIL, ADMIN_PASSWORD, EMPLOYEE_PASSWORD)',
    )
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  const hashedEmployeePassword = await bcrypt.hash(employeePassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: employeeEmail },
    update: {},
    create: {
      email: employeeEmail,
      password: hashedEmployeePassword,
      role: Role.EMPLOYEE,
    },
  })

  console.log('✅ Seeding completed.')
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error('Unknown error', e)
    }
  })
  .finally(async () => prisma.$disconnect())
