const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = await hash('Admin123!', 12)
    const team = await prisma.team.create({
        data: {
            name: "System Team"
        }
    })

    const user = await prisma.user.upsert({
        where: { email: 'admin@vulntrack.app' },
        update: {},
        create: {
            email: 'admin@vulntrack.app',
            name: 'Admin User',
            password,
            role: 'ADMIN',
            isOnboarded: true,
            teamId: team.id
        },
    })
    console.log({ user })
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
