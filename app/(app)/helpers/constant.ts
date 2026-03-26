const validationSatuSehat = {
  resourceType: "OperationOutcome",
  text: {
    status: "generated"
  },
  issue: [
    {
      severity: "error",
      code: "duplicate",
      details: {
        text: "Found duplicate resource: Encounter"
      }
    }
  ]
}
