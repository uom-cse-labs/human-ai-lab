import { Button } from '@/components/ui/button'

interface CategoryButtonProps {
  category: string
  isActive: boolean
  onSelect: (category: string) => void
}

export default function CategoryButton({ category, isActive, onSelect }: CategoryButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={() => onSelect(category)}
      className="font-mono"
    >
      {category}
    </Button>
  )
}
