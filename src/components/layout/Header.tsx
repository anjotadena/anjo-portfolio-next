import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white py-4">
      <nav className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">Portfolio</Link>
        <div className="space-x-4">
          <Link href="/about">About</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  );
}

