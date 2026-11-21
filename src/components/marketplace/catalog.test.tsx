// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CategoryCard, ServiceCard } from './catalog';

describe('catalog cards', () => {
  it('renders category navigation and description', () => {
    render(
      <MemoryRouter>
        <CategoryCard category={{ id: '1', parentId: null, slug: 'home-services', name: 'Home Services', nameSi: null, nameTa: null, description: 'Home care services', sortOrder: 1, isActive: true }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Home Services' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /browse category/i }).getAttribute('href')).toBe('/categories/home-services');
  });

  it('renders a service navigation link', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={{ id: '2', categoryId: '1', slug: 'ac-repair', name: 'AC Repair', description: 'Air conditioner repairs', pricingType: null, priceFrom: null, priceTo: null, currency: 'LKR', isActive: true }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'AC Repair' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /view service/i }).getAttribute('href')).toBe('/services/ac-repair');
  });
});
