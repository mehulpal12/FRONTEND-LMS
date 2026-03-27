import { Bell, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
  <nav className="w-full sticky top-0 z-50 bg-[#faf8ff]/80 backdrop-blur-xl border-b border-[#c1c6d6]/15">
    <div className="flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
      <div className="flex items-center gap-12">
        <span onClick={() => router.push("/")} className="text-2xl font-black tracking-tighter text-[#131b2e] font-sans">Editorial Intelligence</span>
        {/* <div className="hidden md:flex gap-8 text-sm font-semibold text-[#414754]">
          <a href="#" className="hover:text-[#0053da] transition-colors">My Courses</a>
          <a href="#" className="text-[#0053da] border-b-2 border-[#0053da]">Categories</a>
        </div> */}
      </div>
      <div className="flex items-center gap-6">
        {/* <div className="hidden lg:flex items-center bg-[#f2f3ff] px-4 py-2 rounded-full border border-[#0053da]/5">
          <Search className="text-[#727785] w-4 h-4" />
          <input className="bg-transparent border-none focus:ring-0 text-sm w-64 ml-2" placeholder="Search insights..." />
        </div> */}
        <div className="flex gap-4 text-[#414754]">
          {/* <Bell className="w-5 h-5 cursor-pointer hover:text-[#0053da]" /> */}
          <UserCircle onClick={() => router.push("/userInfo")} className="w-5 h-5 cursor-pointer hover:text-[#0053da]" />
        </div>
      </div>
    </div>
  </nav>
  );
}
