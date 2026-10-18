// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Publication } from '@/types'
import PublicationThumbnail from './PublicationThumbnail'

const pub = (extra: Partial<Publication> = {}): Publication => ({
  id: 'p', category: 'DESIGN', title: 'T', authors: 'A', publishedIn: 'Moratuwa Engineering Research Conference (MERCon)',
  year: 2019, abstract: '', keyFindings: [], citation: '', ...extra,
})

describe('PublicationThumbnail', () => {
  it('shows the publication image when there is one', () => {
    const { container } = render(<PublicationThumbnail publication={pub({ imageUrl: 'https://example.org/figure.png' })} />)
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.org/figure.png')
  })

  it('otherwise draws a cover with the venue short name and year', () => {
    const { container } = render(<PublicationThumbnail publication={pub()} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('MERCon')).toBeTruthy()
    expect(screen.getByText('2019')).toBeTruthy()
  })

  it('uses the first words of a venue without an acronym', () => {
    render(<PublicationThumbnail publication={pub({ publishedIn: 'ACM Transactions on Computing for Healthcare' })} />)
    expect(screen.getByText('ACM Transactions on Computing')).toBeTruthy()
  })
})
