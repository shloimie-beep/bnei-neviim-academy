import { LoginForm } from './LoginForm';

export default function ParentLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
      <h1 className="font-display text-section mb-2">Parents</h1>
      <p className="ink-soft mb-8 text-sm text-center">
        Enter your email. We&apos;ll send you a magic link.
      </p>
      <LoginForm initialError={searchParams.error} sent={searchParams.sent === '1'} />
    </main>
  );
}
