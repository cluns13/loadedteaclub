import { MetadataRoute } from 'next';
import { BusinessService } from '@/lib/db/services/businessService';
import { CityService } from '@/lib/db/services/cityService';
import { LoadedTeaClub } from '@/types/models';
import { LocationSummary } from '@/types/cityTypes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locations, businesses, cities] = await Promise.all([
    BusinessService.getAllLocations(),
    BusinessService.findAll(), 
    CityService.getAllCities()
  ]);
  
  // Base URLs
  const routes: MetadataRoute.Sitemap = [
    {
      url: 'https://loadedteafinder.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://loadedteafinder.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://loadedteafinder.com/search',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }
  ];

  // Add location pages
  const locationRoutes: MetadataRoute.Sitemap = locations.map(({ city, state }: { city: string; state: string }) => ({
    url: `https://loadedteafinder.com/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Add business pages
  const businessRoutes: MetadataRoute.Sitemap = businesses.map((business: LoadedTeaClub) => ({
    url: `https://loadedteafinder.com/business/${business.id}`,
    lastModified: business.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Add city pages
  const cityRoutes: MetadataRoute.Sitemap = cities.map((city: LocationSummary) => ({
    url: `https://loadedteafinder.com/loaded-tea/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...routes, 
    ...locationRoutes, 
    ...businessRoutes,
    ...cityRoutes
  ];
}
