import React from "react";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className="bg-zinc-100">{children}</div>;
}

export default Layout;
