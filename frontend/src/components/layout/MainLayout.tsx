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

    const [user, setUser] = useState(() => {
    try {
      const user = localStorage.getItem("auth_user");
      if (user) {
        const { name } = JSON.parse(user);
        return {
          name: name,
          initial: name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
        };
      }
      return { name: "John Doe", initial: "!" };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return { name: "John Doe", initial: "!" };
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header title={title} subtitle={subtitle} initial={initial || user.initial} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
