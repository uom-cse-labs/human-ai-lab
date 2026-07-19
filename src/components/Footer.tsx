import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="border-t border-border-token bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-base font-bold text-neutral-900">
              Human-AI Lab
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              Advancing human-centered artificial intelligence through research,
              innovation, and education.
            </p>
          </div>
          <div className="lg:col-span-3">
            <span className="text-caption uppercase tracking-widest text-text-muted">
              Navigation
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/"
                className="text-sm text-text-secondary no-underline transition-colors duration-200 hover:text-neutral-900"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-text-secondary no-underline transition-colors duration-200 hover:text-neutral-900"
              >
                About
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4">
            <span className="text-caption uppercase tracking-widest text-text-muted">
              Contact
            </span>
            <div className="mt-4 flex flex-col gap-1 text-sm text-text-secondary">
              <span>Department of Computer Science and Engineering</span>
              <span>University of Moratuwa</span>
              <span>Katubedda, Moratuwa 10400, Sri Lanka</span>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-divider-token pt-8">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Human-AI Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
