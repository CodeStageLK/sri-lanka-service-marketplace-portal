import { useQuery } from '@tanstack/react-query';
import { listCities, listDistricts, listProvinces } from '@/services/discovery-api';
import { FormField, Select } from '@/components/ui/form-controls';

export interface LocationSelection {
  provinceId: string;
  districtId: string;
  locationId: string;
}

interface Props {
  value: LocationSelection;
  onChange: (value: LocationSelection) => void;
  idPrefix?: string;
}

export function LocationSelector({ value, onChange, idPrefix = 'search-location' }: Props) {
  const provinces = useQuery({
    queryKey: ['locations', 'provinces'],
    queryFn: ({ signal }) => listProvinces(signal),
  });
  const districts = useQuery({
    queryKey: ['locations', 'districts', value.provinceId],
    enabled: Boolean(value.provinceId),
    queryFn: ({ signal }) => listDistricts(value.provinceId, signal),
  });
  const cities = useQuery({
    queryKey: ['locations', 'cities', value.districtId],
    enabled: Boolean(value.districtId),
    queryFn: ({ signal }) => listCities(value.districtId, signal),
  });

  function provinceChanged(provinceId: string) {
    onChange({ provinceId, districtId: '', locationId: '' });
  }

  function districtChanged(districtId: string) {
    onChange({ ...value, districtId, locationId: '' });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <FormField label="Province" htmlFor={`${idPrefix}-province`}>
        <Select id={`${idPrefix}-province`} value={value.provinceId} onChange={(event) => provinceChanged(event.target.value)}>
          <option value="">All provinces</option>
          {provinces.data?.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
        </Select>
      </FormField>
      <FormField label="District" htmlFor={`${idPrefix}-district`}>
        <Select id={`${idPrefix}-district`} value={value.districtId} disabled={!value.provinceId} onChange={(event) => districtChanged(event.target.value)}>
          <option value="">All districts</option>
          {districts.data?.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
        </Select>
      </FormField>
      <FormField label="City or town" htmlFor={`${idPrefix}-city`}>
        <Select id={`${idPrefix}-city`} value={value.locationId} disabled={!value.districtId} onChange={(event) => onChange({ ...value, locationId: event.target.value })}>
          <option value="">All cities and towns</option>
          {cities.data?.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </Select>
      </FormField>
    </div>
  );
}
