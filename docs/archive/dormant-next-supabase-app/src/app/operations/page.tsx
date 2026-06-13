import { TaskApp } from './components/TaskApp';

// Legacy/dormant Next route kept only as a migration reference.
// The live BNA Operations dashboard is the Express/static page in `public/operations.html`.
export const metadata = {
  title: 'Legacy BNA TaskApp',
  description: 'Dormant local task prototype. Live Operations dashboard source: public/operations.html.',
};

export default function OperationsPage() {
  return <TaskApp />;
}
