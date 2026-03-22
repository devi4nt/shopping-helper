import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.code || !body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Invite code, username, and password are required' })
  }

  if (body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  const invite = await prisma.inviteCode.findUnique({
    where: { code: body.code },
  })

  if (!invite || invite.usedBy) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or already used invite code' })
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: body.username },
  })

  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Username already taken' })
  }

  const hashedPassword = await bcrypt.hash(body.password, 12)

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: hashedPassword,
    },
  })

  await prisma.inviteCode.update({
    where: { code: body.code },
    data: { usedBy: user.id, usedAt: new Date() },
  })

  await createSession(event, user.id)

  return {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  }
})
