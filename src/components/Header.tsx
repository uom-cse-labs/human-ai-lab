import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="border-border border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link to="/" className="font-semibold text-neutral-900 no-underline">
          Human AI Lab
        </Link>
        <Link to="/about" className="text-sm text-neutral-500 no-underline">
          About
        </Link>
      </nav>
    </header>
  )
}
