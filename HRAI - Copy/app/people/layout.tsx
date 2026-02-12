import "@/app/styles/deriv.css";
import "@/app/styles/people.css";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import ChatWidget from "@/app/components/ChatWidget";

export const metadata = {
  title: "derivHR — People",
};

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="deriv-app">
      <Sidebar />
      <div className="sidebar-overlay"></div>
      <main className="main">
        <Topbar />
        <div className="page-content">{children}</div>
      </main>
      <ChatWidget />
    </div>
  );
}
