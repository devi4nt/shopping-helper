export default defineTask({
  meta: {
    name: 'cleanup:checked-items',
    description: 'Delete items checked more than 7 days ago',
  },
  async run() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const result = await prisma.item.deleteMany({
      where: {
        checked: true,
        checkedAt: { lt: cutoff },
      },
    })

    return { result: `Deleted ${result.count} checked items older than 7 days` }
  },
})
