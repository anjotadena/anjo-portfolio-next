export function SiteFooter() {
  return (
    <footer className="py-6">
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} Portfolio. All rights reserved.
      </p>
    </footer>
  );
}

