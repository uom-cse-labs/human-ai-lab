import { cn } from "@/lib/utils"

/** A small round portrait, overlapping its neighbours in a row. */
export default function TeamAvatar({ name, imageUrl, className }: { name: string; imageUrl: string; className?: string }) {
  return (
    <img
      src={imageUrl}
      alt={name}
      className={cn("size-10 rounded-full border-2 border-background object-cover", className)}
    />
  )
}
