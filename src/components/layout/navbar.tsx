import { getNavigation, getSiteSettings } from "@/lib/content";
import { getFields } from "@/lib/types";
import type { NavigationMenuFields, SiteSettingsFields } from "@/lib/types";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const [navEntry, settingsEntry] = await Promise.all([getNavigation("header"), getSiteSettings()]);

  const nav = navEntry ? getFields<NavigationMenuFields>(navEntry) : ({} as NavigationMenuFields);
  const settings = settingsEntry
    ? getFields<SiteSettingsFields>(settingsEntry)
    : ({} as SiteSettingsFields);

  const items = nav.items ?? [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Stories", href: "/blog" },
  ];

  const siteName = settings.siteName ?? "Cold Water Stories";

  return <NavbarClient items={items} siteName={siteName} />;
}
