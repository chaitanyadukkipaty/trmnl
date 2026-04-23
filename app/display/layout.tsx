import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard Display",
  description: "Always-on iPad display",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dashboard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-trmnl-bg">
      {children}
    </div>
  );
}
