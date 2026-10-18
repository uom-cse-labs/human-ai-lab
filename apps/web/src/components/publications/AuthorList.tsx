import { plainName, splitAuthors } from '@/lib/publications'

/** The authors, with lab members in bold (a common convention on lab publication pages). */
export default function AuthorList({ authors, labMembers }: { authors: string; labMembers: Set<string> }) {
  const names = splitAuthors(authors)
  return (
    <p className="text-sm leading-relaxed text-on-background/70">
      {names.map((name, index) => (
        <span key={`${name}-${index}`}>
          {labMembers.has(plainName(name)) ? <strong className="font-bold text-on-background">{name}</strong> : name}
          {index < names.length - 2 ? ', ' : index === names.length - 2 ? ' and ' : ''}
        </span>
      ))}
    </p>
  )
}
