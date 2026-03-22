import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  const user = await prisma.user.findUnique({
    where: { username: body.username },
  })

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  await createSession(event, user.id)

  return {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  }
})
