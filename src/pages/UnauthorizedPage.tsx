function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>

        <p className="mt-2 text-text">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
