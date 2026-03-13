import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-mabel-text/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <Image
          src="/images/mabel-logo.png"
          alt="Mabel"
          width={120}
          height={30}
          className="h-6 w-auto opacity-60"
        />

        <p className="text-xs text-mabel-subtle">
          &copy; {new Date().getFullYear()} Mabel. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
