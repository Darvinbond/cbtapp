export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] flex justify-center items-center w-screen">{children}</div>
  );
}
