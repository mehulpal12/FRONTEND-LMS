import { Bell, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  const router = useRouter();
  return (
  <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
    <div className="flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
      <div className="flex items-center gap-12">
        <span 
          onClick={() => router.push("/")} 
          className="text-2xl font-black tracking-tighter text-foreground font-sans cursor-pointer hover:text-primary transition-colors"
        >
          Editorial Intelligence
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-muted-foreground">
          <UserCircle 
            onClick={() => router.push("/userInfo")} 
            className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" 
          />
          <ModeToggle />
        </div>
      </div>
    </div>
  </nav>
  );
}
