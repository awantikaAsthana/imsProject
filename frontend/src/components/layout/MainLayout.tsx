import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  initial?: string;
}

const MainLayout = ({ children, title, subtitle, initial}: MainLayoutProps) => {


  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} initial={initial} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
