import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner component', () => {
  test('renders correctly', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    
    expect(spinner).toBeInTheDocument();
  });

  test('applies default loading class', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;
    
    expect(wrapper).toHaveClass('loading');
    expect(wrapper).not.toHaveClass('full-page-loading');
  });

  test('applies full-page-loading class when fullPage is true', () => {
    const { container } = render(<LoadingSpinner fullPage={true} />);
    const wrapper = container.firstChild;
    
    expect(wrapper).toHaveClass('loading');
    expect(wrapper).toHaveClass('full-page-loading');
  });

  test('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    const wrapper = container.firstChild;
    
    expect(wrapper).toHaveClass('custom-spinner');
  });

  test('renders spinner with custom size', () => {
    const { container } = render(<LoadingSpinner size={64} />);
    const spinner = container.querySelector('svg');
    
    expect(spinner).toHaveAttribute('width', '64');
    expect(spinner).toHaveAttribute('height', '64');
  });

  test('renders spinner with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('svg');
    
    expect(spinner).toHaveAttribute('width', '48');
    expect(spinner).toHaveAttribute('height', '48');
  });
});