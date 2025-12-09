const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

const { randomBytes } = require('crypto')

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.org'
    // Generate secure random password if not provided in env
    const rawPassword = process.env.ADMIN_PASSWORD || randomBytes(16).toString('hex')

    const password = await hash(rawPassword, 12)

    const team = await prisma.team.create({
        data: {
            name: "System Team"
        }
    })

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password,
            role: 'ADMIN',
            isOnboarded: true,
            teamId: team.id
        },
    })

    console.log("✅ Seed successful.")
    console.log("----------------------------------------")
    console.log(`Team: ${team.name}`)
    console.log(`User: ${user.email}`)
    if (!process.env.ADMIN_PASSWORD) {
        console.log(`⚠️  GENERATED PASSWORD: ${rawPassword}`)
        console.log("⚠️  Please save this password immediately.")
    } else {
        console.log("Password set from environment variable.")
    }
    console.log("----------------------------------------")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
