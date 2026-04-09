export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76]">
      {children}
    </div>
  );
}