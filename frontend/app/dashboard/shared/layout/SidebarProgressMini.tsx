type SidebarProgressMiniProps = {
  collapsed: boolean;
};

export function SidebarProgressMini({ collapsed }: SidebarProgressMiniProps) {
  // Placeholder — real logic arrives in Step 8.
  // Will only render when the current route is NOT /dashboard/intern.
  if (collapsed) return null;
  return null;
}
