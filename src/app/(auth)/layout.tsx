export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Hero Draw
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your Game. Their Future.
          </p>
        </div>
        <div className="card">
          {children}
        </div>
      </div>
    </div>
  );
}
