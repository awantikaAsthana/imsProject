import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileMenuTrigger } from "./Sidebar";

interface HeaderProps {
  title: string;
  subtitle?: string;
  initial?: string;

}

const Header = ({ title, subtitle, initial }: HeaderProps) => {
   return (
<header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileMenuTrigger />
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        </div>
     


     <div className="flex items-center gap-2 md:gap-4">
       


        <Avatar className="h-8 w-8 md:h-9 md:w-9">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
