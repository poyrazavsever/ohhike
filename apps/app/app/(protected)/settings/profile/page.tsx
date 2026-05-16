import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { SettingsNotice } from "../_components/settings-notice";

export default function ProfileSettingsPage() {
  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Profile"
        subtitle="Account details and security are managed through your signed-in session."
        mascotSrc="/maskotlar/elleIsaretEtme.png"
      />

      <SettingsNotice
        title="Use the account menu"
        body="Open the account card at the bottom of the sidebar to manage your Clerk profile, email, password and connected accounts, or to sign out."
      />
    </section>
  );
}
