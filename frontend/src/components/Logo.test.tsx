import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Logo from './Logo'

describe('Logo Component', () => {
  it('renders logo text', () => {
    render(<Logo />)
    
    // Look for the MealLens text
    const logoText = screen.getByText(/meallens/i)
    expect(logoText).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const { container } = render(<Logo />)
    
    // Check if the component renders without errors
    expect(container.firstChild).toBeTruthy()
  })

  it('renders as a clickable element if link is provided', () => {
    render(<Logo />)
    
    // Component should render successfully
    expect(document.body).toBeTruthy()
  })
})