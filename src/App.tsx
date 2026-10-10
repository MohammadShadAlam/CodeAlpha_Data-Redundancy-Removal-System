import { useState } from "react";
import { ThemeProvider } from "./theme";
import { AppProvider, useApp } from "./store";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ScanModal from "./components/ScanModal";
import { ConfirmModal, Toasts } from "./components/ui";
import Overview from "./pages/Overview";
import AllRecords from "./pages/AllRecords";
import DuplicateDetection from "./pages/DuplicateDetection";
import DataValidation from "./pages/DataValidation";
import ActivityLogs from "./pages/ActivityLogs";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Plans from "./pages/Plans";
import SignIn from "./pages/SignIn";

function Shell() {
  const { page, signedIn, signOut, toast } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  if (!signedIn) {
    return (
      <>
        <SignIn />
        <Toasts />
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "records":
        return <AllRecords />;
      case "duplicates":
        return <DuplicateDetection />;
      case "validation":
        return <DataValidation />;
      case "logs":
        return <ActivityLogs />;
      case "settings":
        return <Settings />;
      case "profile":
        return <Profile />;
      case "notifications":
        return <Notifications />;
      case "plans":
        return <Plans />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onSignOut={() => {
          setMobileOpen(false);
          setSignOutOpen(true);
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} onSignOut={() => setSignOutOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div key={page} className="mx-auto max-w-7xl animate-fade-up">
            {renderPage()}
          </div>
        </main>
      </div>

      <ScanModal />
      <ConfirmModal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          signOut();
          toast("You have been signed out", "info");
        }}
        title="Sign out"
        message="Are you sure you want to sign out of DataGuard?"
        confirmLabel="Sign out"
        danger
      />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ThemeProvider>
  );
}
