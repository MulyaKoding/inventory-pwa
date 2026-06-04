export const notDeleted = {
  AND: [
    {
      OR: [{ deleteAt: { equals: null } }, { deleteAt: { isSet: false } }]
    }
  ]
}
