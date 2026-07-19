import { Link } from '@tanstack/react-router'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-token bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link
          to="/"
          className="text-base font-bold text-neutral-900 no-underline"
        >
          Human AI Lab
        </Link>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-caption uppercase tracking-widest text-text-muted no-underline transition-colors duration-200 hover:text-neutral-900 [&.active]:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
