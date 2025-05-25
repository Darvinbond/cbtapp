import HeaderAuth from "@/components/header-auth";
import { CornerDownLeft, Monitor, TestTubeDiagonal } from "lucide-react";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "CBT Admin",
  description: "CBT Admin",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex bg-white flex-col dgap-[40px] items-center">
      <nav className="w-full z-30 bg-white sticky top-0 flex justify-center border-b border-b-foreground/10 h-[48px]">
        <div className="w-full flex justify-between items-center dp-3 px-[40px] text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>
              <CornerDownLeft className="size-[20px]" />
            </Link>
          </div>
          <HeaderAuth />
        </div>
      </nav>
      <div className="flex flex-col gap-20 w-full h-max">{children}</div>
    </main>
  );
}
