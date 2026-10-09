class ControlPlaneStorage {
  addProductKey() { throw new Error('not implemented'); }
  resolveVerificationKey() { throw new Error('not implemented'); }
  acceptEvent() { throw new Error('not implemented'); }
  upsertCase() { throw new Error('not implemented'); }
  deleteCase() { throw new Error('not implemented'); }
  insertCommand() { throw new Error('not implemented'); }
}

module.exports = {
  ControlPlaneStorage,
};
