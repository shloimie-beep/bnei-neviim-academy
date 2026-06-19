const PROMPT_INTAKE_FOLDER_CONTRACT_VERSION = 'w3-prompt-intake-folders-v1';

const RAMBLE_PROMPT_FOLDER_TREE = {
  name: 'BNA V2',
  children: [
    {
      name: '00 Upload Here - Rambles & Prompts',
      children: [
        { name: '10 Queued' },
        { name: '20 In Progress' },
        { name: '30 Needs Decision' },
        { name: '40 Completed' },
        { name: '90 Archive' },
      ],
    },
  ],
};

const STAGE_BY_STATUS = {
  new: '10 Queued',
  triaged: '10 Queued',
  queued: '10 Queued',
  in_progress: '20 In Progress',
  needs_decision: '30 Needs Decision',
  verifying: '20 In Progress',
  completed: '40 Completed',
  failed: '30 Needs Decision',
  archived: '90 Archive',
};

function flattenFolderTree(node = RAMBLE_PROMPT_FOLDER_TREE, parentPath = '') {
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  const rows = [{ name: node.name, path, parent_path: parentPath || null }];
  for (const child of node.children || []) rows.push(...flattenFolderTree(child, path));
  return rows;
}

function buildProviderNeutralFolderSetupPlan({ root_name: rootName = 'BNA V2', provider = 'drive', root_id: rootId = null } = {}) {
  const root = {
    ...RAMBLE_PROMPT_FOLDER_TREE,
    name: rootName,
  };
  return {
    contract_version: PROMPT_INTAKE_FOLDER_CONTRACT_VERSION,
    provider,
    root_name: rootName,
    root_id: rootId,
    dry_run_only: true,
    external_mutation_allowed: false,
    folders: flattenFolderTree(root),
    operations: flattenFolderTree(root).map((folder) => ({
      action: 'ensure_folder',
      provider,
      path: folder.path,
      parent_path: folder.parent_path,
      root_id: rootId,
      mutation_gate: 'Prompt 05 or explicit operator-approved Drive setup',
    })),
    final_wiring_needed: [
      'Use the existing Google Drive auth/setup path to create missing folders after explicit approval.',
      'Persist provider folder IDs outside this module, then pass the resolved IDs into intake source records.',
      'Move or mirror source files between stages only from an approved worker or integration step.',
    ],
  };
}

function stageForPromptStatus(status = 'new') {
  return STAGE_BY_STATUS[String(status || '').toLowerCase()] || '10 Queued';
}

module.exports = {
  PROMPT_INTAKE_FOLDER_CONTRACT_VERSION,
  RAMBLE_PROMPT_FOLDER_TREE,
  STAGE_BY_STATUS,
  flattenFolderTree,
  buildProviderNeutralFolderSetupPlan,
  stageForPromptStatus,
};
