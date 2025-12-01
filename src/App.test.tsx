import {describe, expect, test} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

describe('counter tests', () => {
    
  test("MealEx", () => {
    render(<App />);
    expect(screen.getByText('MealEx')).toBeDefined();
  });
});