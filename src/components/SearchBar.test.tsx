import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a tag when pressing Enter (trims input)', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={[]} setSelectedTags={setSelectedTags} />)

    const input = screen.getByPlaceholderText('Add Filter') as HTMLInputElement
    fireEvent.change(input, { target: { value: '  Vegan  ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(setSelectedTags).toHaveBeenCalledTimes(1)
    expect(setSelectedTags).toHaveBeenCalledWith(['Vegan'])
  })

  it('adds a tag when clicking the Add button', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={[]} setSelectedTags={setSelectedTags} />)

    const input = screen.getByPlaceholderText('Add Filter') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Vegetarian' } })
    const addButton = screen.getByRole('button', { name: /add/i })
    fireEvent.click(addButton)

    expect(setSelectedTags).toHaveBeenCalledTimes(1)
    expect(setSelectedTags).toHaveBeenCalledWith(['Vegetarian'])
  })

  it('does not add duplicate tags (case-sensitive current behavior)', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={['Vegan']} setSelectedTags={setSelectedTags} />)

    const input = screen.getByPlaceholderText('Add Filter') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Vegan' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(setSelectedTags).not.toHaveBeenCalled()
  })

  it('removes a tag when its pill is clicked', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={['Vegan', 'Halal']} setSelectedTags={setSelectedTags} />)

    // the component sets aria-label `remove ${tag}` on each pill button
    const removeVegan = screen.getByLabelText('remove Vegan')
    fireEvent.click(removeVegan)

    expect(setSelectedTags).toHaveBeenCalledTimes(1)
    expect(setSelectedTags).toHaveBeenCalledWith(['Halal'])
  })

  it('ignores empty/whitespace-only input', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={[]} setSelectedTags={setSelectedTags} />)

    const input = screen.getByPlaceholderText('Add Filter') as HTMLInputElement
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(setSelectedTags).not.toHaveBeenCalled()
  })

  it('respects a custom placeholder prop', () => {
    const setSelectedTags = vi.fn()
    render(<SearchBar selectedTags={[]} setSelectedTags={setSelectedTags} placeholder="Search tags" />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.placeholder).toBe('Search tags')
  })
})
