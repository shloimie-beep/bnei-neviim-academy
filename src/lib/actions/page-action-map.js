const { listActions } = require('./registry');

function buildPageActionMap(actions = listActions()) {
  return actions.reduce((map, action) => {
    for (const page of action.page_contexts || []) {
      if (!map[page]) map[page] = [];
      map[page].push({
        action_id: action.action_id,
        label: action.label,
        category: action.category,
        approval_required: Boolean(action.approval_required),
        ui_button_labels: action.ui_button_labels || [],
        related_routes: action.related_routes || [],
      });
    }
    return map;
  }, {});
}

module.exports = {
  buildPageActionMap,
};
