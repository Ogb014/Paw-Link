import { Link } from "react-router-dom";
import { PawPrint, Twitter, Instagram, Facebook } from "lucide-react";
import { Logo } from "../Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-neutral-500">
              The premium platform for dog breeders, buyers, and breeding service
              providers. Manage your kennel, connect with buyers, and grow your
              reputation.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Twitter, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Platform",
              links: ["Features", "Marketplace", "Pricing", "Breeder Profiles"],
            },
            {
              title: "Resources",
              links: ["Help Center", "Breeding Guide", "Community", "Blog"],
            },
            {
              title: "Company",
              links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-900">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="#"
                      className="text-sm text-neutral-500 transition-colors hover:text-primary-600"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-6 sm:flex-row">
          <p className="flex items-center gap-1.5 text-sm text-neutral-400">
            <PawPrint className="h-4 w-4" />
            Paw Link © 2026. All rights reserved.
          </p>
          <p className="text-sm text-neutral-400">
            Built for responsible breeders and loving dog owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
