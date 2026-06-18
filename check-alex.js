const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

;(async () => {
  const alex = await p.user.findUnique({ where: { id: '8be478d3-e9c7-498a-a67b-1eaeed8e662a' } })
  console.log('Alex:', JSON.stringify(alex, null, 2))
  await p.$disconnect()
})()