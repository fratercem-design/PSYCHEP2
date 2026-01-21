export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
