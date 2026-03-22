import Link from "next/link";
import { getSiteSettings, getNavigation } from "@/lib/content";
import { getFields } from "@/lib/types";
import type { SiteSettingsFields, NavigationMenuFields } from "@/lib/types";

export async function Footer() {
  const [settingsEntry, navEntry] = await Promise.all([getSiteSettings(), getNavigation("footer")]);

  const settings = settingsEntry
    ? getFields<SiteSettingsFields>(settingsEntry)
    : ({} as SiteSettingsFields);
  const nav = navEntry ? getFields<NavigationMenuFields>(navEntry) : ({} as NavigationMenuFields);

  const siteName = settings.siteName ?? "Forme Showcase";
  const footerText = settings.footerText ?? "Built with Forme — the AI-native headless CMS engine.";
  const copyrightYear = settings.copyrightYear ?? new Date().getFullYear();
  const socialLinks = settings.socialLinks ?? [];
  const navItems = nav.items ?? [];

  return (
    <footer className="bg-ocean-950 text-sand-400 border-t border-ocean-800">
      <div className="max-w-content mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display text-2xl text-reef-500 hover:text-reef-400 transition-colors"
            >
              forme
            </Link>
            <p className="mt-3 text-sm text-sand-500 max-w-sm">{footerText}</p>
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mt-4 flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sand-500 hover:text-reef-400 text-sm transition-colors"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation links */}
          {navItems.length > 0 && (
            <div>
              <h3 className="text-sand-200 text-sm font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sand-500 hover:text-reef-400 text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          <div>
            <h3 className="text-sand-200 text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://formecms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-500 hover:text-reef-400 text-sm transition-colors"
                >
                  Forme Website
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/formecms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-500 hover:text-reef-400 text-sm transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://docs.forme.build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-500 hover:text-reef-400 text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="separator-fade my-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-meta text-sand-600">
            &copy; {copyrightYear} {siteName}. All rights reserved.
          </p>
          <p className="text-meta text-sand-600">
            Powered by{" "}
            <a
              href="https://formecms.com"
              className="text-reef-500 hover:text-reef-400 transition-colors"
            >
              Forme CMS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
