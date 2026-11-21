// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProviderSearchCard } from './ProviderSearchCard';

describe('ProviderSearchCard', () => {
  it('renders only supplied provider fields', () => {
    render(
      <MemoryRouter>
        <ProviderSearchCard provider={{
          id: 'provider-1',
          providerType: 'INDIVIDUAL',
          displayName: 'Nimal Perera',
          description: 'Experienced service provider',
          experienceYears: 8,
          profileImageId: null,
          verificationStatus: 'APPROVED',
          averageRating: '4.5',
          totalReviews: 12,
          profileCompletion: 90,
          providerServices: [{ id: 'assignment-1', service: { id: 'service-1', name: 'AC Repair', slug: 'ac-repair' } }],
          serviceAreas: [{ id: 'area-1', location: { id: 'location-1', parentId: null, type: 'CITY', slug: 'colombo', name: 'Colombo', isActive: true } }],
        }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Nimal Perera' })).toBeTruthy();
    expect(screen.getByText('Verified')).toBeTruthy();
    expect(screen.getByText(/4\.5 \(12 reviews\)/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View profile' }).getAttribute('href')).toBe('/providers/provider-1');
  });
});
