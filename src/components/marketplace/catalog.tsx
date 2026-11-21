import { ArrowRight, FolderTree } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/display';
import { Button } from '@/components/ui/button';
import type { Category, Service } from '@/types/catalog';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-secondary/10 text-secondary">
        <FolderTree className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-primary">{category.name}</h2>
      {category.description ? <p className="mt-2 line-clamp-3 flex-1 text-sm text-foreground-secondary">{category.description}</p> : null}
      <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary" to={`/categories/${category.slug}`}>
        Browse category <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <CategoryCard key={category.id} category={category} />)}</div>;
}

export function SubcategoryCard({ category, parentSlug }: { category: Category; parentSlug: string }) {
  return (
    <Link to={`/categories/${parentSlug}/${category.slug}`} className="block">
      <Card className="h-full p-5 transition-shadow hover:shadow-md">
        <h3 className="font-semibold text-primary">{category.name}</h3>
        {category.description ? <p className="mt-2 line-clamp-3 text-sm text-foreground-secondary">{category.description}</p> : null}
      </Card>
    </Link>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{service.category?.name}</p>
      <h2 className="mt-2 text-lg font-semibold text-primary">{service.name}</h2>
      {service.description ? <p className="mt-2 line-clamp-4 flex-1 text-sm text-foreground-secondary">{service.description}</p> : null}
      <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary" to={`/services/${service.slug}`}>
        View service <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>;
}

export function CategoryHeader({ category }: { category: Category }) {
  return (
    <header className="rounded-xl border border-border bg-card px-6 py-8 sm:px-8">
      <h1 className="text-3xl font-bold text-primary sm:text-4xl">{category.name}</h1>
      {category.nameSi ? <p lang="si" className="mt-2 text-sm text-foreground-secondary">{category.nameSi}</p> : null}
      {category.description ? <p className="mt-4 max-w-3xl text-base text-foreground-secondary">{category.description}</p> : null}
      <Button className="mt-6" asChild><Link to={`/providers?category=${encodeURIComponent(category.id)}`}>Browse providers</Link></Button>
    </header>
  );
}
