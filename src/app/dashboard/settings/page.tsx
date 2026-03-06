import { Metadata } from "next";
import SettingsPageContent from "./SettingsPageContent";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsPageContent />;
}
