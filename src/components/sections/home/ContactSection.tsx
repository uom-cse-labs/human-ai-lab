import { Mail, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

function GoogleScholarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
    </svg>
  )
}

function ResearchGateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.074 12.002c0 3.746-3.044 6.783-6.796 6.783-3.752 0-6.796-3.037-6.796-6.783s3.044-6.783 6.796-6.783c3.752 0 6.796 3.037 6.796 6.783zm-2.914-4.06v-.002c-1.062-.791-2.355-1.244-3.746-1.244-3.52 0-6.373 2.85-6.373 6.365 0 2.19 1.105 4.125 2.783 5.267.594-2.666 2.646-6.617 7.336-10.386z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const contactDetails = [
  {
    icon: Mail,
    label: 'Email',
    value: 'humanai@cse.mrt.ac.lk',
    href: 'mailto:humanai@cse.mrt.ac.lk',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: (
      <>
        Department of Computer Science & Engineering
        <br />
        University of Moratuwa
        <br />
        Moratuwa 10400, Sri Lanka
      </>
    ),
  },
  {
    icon: Phone,
    label: 'Telephone',
    value: (
      <div className="space-y-2">
        <div>
          <span className="font-semibold text-on-background">Prof. Samantha Thelijjagoda</span>
          <br />
          <a href="tel:+94112650537" className="hover:text-primary transition-colors">
            +94 11 265 0537
          </a>
        </div>
        <div>
          <span className="font-semibold text-on-background">Dr. Isuru Nawinne</span>
          <br />
          <a href="tel:+94112650563" className="hover:text-primary transition-colors">
            +94 11 265 0563
          </a>
        </div>
      </div>
    ),
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Monday – Friday, 9:00 AM – 5:00 PM (SLST)',
  },
];

const referenceLinks = [
  { label: 'Google Scholar', href: '#', icon: GoogleScholarIcon },
  { label: 'ResearchGate', href: '#', icon: ResearchGateIcon },
  { label: 'LinkedIn', href: '#', icon: LinkedInIcon },
];

export default function ContactSection() {
  return (
    <section id="rounded-contact" className="max-w-7xl mx-auto px-6 py-28 border-b border-outline">
      <div className="mb-16">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          LABORATORY CONTACT
        </span>
        <h2 className="font-sans text-4xl md:text-5xl font-black tracking-tighter text-on-background mt-2 uppercase select-none">
          Connect with AIM
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 space-y-10">
          {contactDetails.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-surface flex items-center justify-center border border-outline rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-1">
                    {item.label}
                  </p>
                  <div className="font-sans text-sm text-on-background/60 leading-relaxed">
                    {item.href ? (
                      <a href={item.href} className="hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-6">
          <div className="bg-surface-dim border border-outline p-10 space-y-8 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full">
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-black text-primary tracking-[0.2em] uppercase">
                  Research Profiles
                </p>
                <p className="font-sans text-sm text-on-background/60 leading-relaxed mt-0.5">
                  Explore our published work and academic network.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {referenceLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-4 w-full px-6 py-4 bg-background border border-outline hover:border-primary/40 hover:bg-surface transition-colors rounded-2xl group"
                  >
                    <div className="w-10 h-10 shrink-0 bg-surface-dim border border-outline flex items-center justify-center rounded-full group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                      <Icon className="w-5 h-5 text-on-background/40 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="flex-1 font-sans text-sm font-medium text-on-background/70 group-hover:text-on-background transition-colors">
                      {link.label}
                    </span>
                    <ExternalLink className="w-4 h-4 text-on-background/20 group-hover:text-primary transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
