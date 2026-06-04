export const notDeleted = {
  AND: [
    {
      OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
    }
  ]
}
