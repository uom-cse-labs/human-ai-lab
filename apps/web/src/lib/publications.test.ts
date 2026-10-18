import { describe, expect, it } from 'vitest'
import type { Publication } from '@/types'
import { bibtex, paperLink, plainName, publicationType, splitAuthors } from './publications'

const pub = (extra: Partial<Publication> = {}): Publication => ({
  id: 'p', category: 'DESIGN', title: 'A Framework for Adaptive User Interfaces', authors: 'Nilanka Rathnayake, Dulani Meedeniya and Indika Perera',
  publishedIn: 'Moratuwa Engineering Research Conference (MERCon)', year: 2019, abstract: '', keyFindings: [], citation: '', ...extra,
})

describe('publications', () => {
  it('works out the type from the venue unless an editor set it', () => {
    expect(publicationType(pub())).toBe('conference')
    expect(publicationType(pub({ publishedIn: 'ACM Transactions on Computing for Healthcare' }))).toBe('journal')
    expect(publicationType(pub({ publishedIn: 'NeurIPS Workshop on HCAI' }))).toBe('workshop')
    expect(publicationType(pub({ type: 'book-chapter' }))).toBe('book-chapter')
  })

  it('splits author lists and strips titles for matching', () => {
    expect(splitAuthors(pub().authors)).toEqual(['Nilanka Rathnayake', 'Dulani Meedeniya', 'Indika Perera'])
    expect(plainName('Prof. Indika Perera')).toBe('indika perera')
    expect(plainName('Eng. Prof. Indika Perera')).toBe('indika perera')
    expect(plainName('Dr. Chathuranga Hettiarachchi')).toBe('chathuranga hettiarachchi')
  })

  it('links to the DOI first, then the publisher', () => {
    expect(paperLink(pub({ doi: '10.1109/MERCon.2019.1', url: 'https://ieee.org/x' }))).toBe('https://doi.org/10.1109/MERCon.2019.1')
    expect(paperLink(pub({ url: 'https://ieee.org/x' }))).toBe('https://ieee.org/x')
    expect(paperLink(pub())).toBeUndefined()
  })

  it('writes BibTeX with the right entry type', () => {
    expect(bibtex(pub({ doi: '10.1109/MERCon.2019.1' }))).toBe(`@inproceedings{rathnayake2019framework,
  title = {{A Framework for Adaptive User Interfaces}},
  author = {Nilanka Rathnayake and Dulani Meedeniya and Indika Perera},
  booktitle = {Moratuwa Engineering Research Conference (MERCon)},
  year = {2019},
  doi = {10.1109/MERCon.2019.1}
}`)
    expect(bibtex(pub({ publishedIn: 'The Visual Computer' }))).toMatch(/^@article\{.*\n[\s\S]*journal = \{The Visual Computer\}/)
  })
})
