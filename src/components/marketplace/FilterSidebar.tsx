'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryIcon } from '@/lib/utils/category-icons';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Category = { id: string; name: string; slug: string; count?: number };

interface FilterSidebarProps {
  /** Current category id (or undefined for "All APIs") */
  category: string | undefined;
  /** Build href for category filter; pass null for "All APIs" */
  categoryHref: (categoryId: string | null) => string;
  categories: Category[];
  query: string;
  sort: string;
  freeOnly: boolean;
  priceMin: number | undefined;
  priceMax: number | undefined;
  minRating: number | undefined;
  tags: string[];
  /** Open sections by default: categories. Price open if price filter active. */
  defaultOpenSections?: string[];
  /** Form id to associate with external submit (optional) */
  formId?: string;
  /** When true, render a full form (for use inside Sheet/mobile); when false, inputs use form={formId} */
  standaloneForm?: boolean;
  /** When provided, category links call this on click (e.g. to close sheet and navigate) */
  onCategoryClick?: (categoryId: string | null) => void;
}

const PRICE_PRESETS = [
  { label: 'Free', min: 0, max: 0 },
  { label: '$0–$50', min: 0, max: 50 },
  { label: '$50–$200', min: 50, max: 200 },
  { label: '$200+', min: 200, max: undefined },
] as const;

const RATING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '4.5', label: '4.5+' },
] as const;

export function FilterSidebar({
  category,
  categoryHref,
  categories,
  query,
  sort,
  freeOnly,
  priceMin,
  priceMax,
  minRating,
  tags,
  defaultOpenSections = ['categories'],
  formId = 'marketplace-filters',
  standaloneForm = false,
  onCategoryClick,
}: FilterSidebarProps) {
  const hasPriceFilter = freeOnly || priceMin != null || priceMax != null;
  const defaultValue = [
    'categories',
    ...(hasPriceFilter ? ['price' as const] : []),
  ].filter((s) => defaultOpenSections.includes(s));
  const accordionDefault = defaultValue.length ? defaultValue : ['categories'];

  const content = (
    <>
      <Accordion
        type="multiple"
        defaultValue={accordionDefault}
        className="w-full border-0"
      >
        {/* Categories */}
        <AccordionItem value="categories" className="border-b border-border">
          <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-3 hover:no-underline hover:text-foreground">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <nav className="space-y-0.5" aria-label="Filter by category">
              <a
                href={categoryHref(null)}
                onClick={onCategoryClick ? (e) => { e.preventDefault(); onCategoryClick(null); } : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                  !category
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" />
                All APIs
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={categoryHref(cat.id)}
                  onClick={onCategoryClick ? (e) => { e.preventDefault(); onCategoryClick(cat.id); } : undefined}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                    category === cat.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <CategoryIcon slug={cat.slug} name={cat.name} className="h-4 w-4 shrink-0 opacity-80" />
                  <span>{cat.name}</span>
                  {cat.count != null && (
                    <span className="ml-auto text-muted-foreground">({cat.count})</span>
                  )}
                </a>
              ))}
            </nav>
          </AccordionContent>
        </AccordionItem>

        {/* Price & Plans */}
        <AccordionItem value="price" className="border-b border-border">
          <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-3 hover:no-underline hover:text-foreground">
            Price &amp; Plans
            {hasPriceFilter && (
              <span className="ml-2 text-primary">({[freeOnly, priceMin != null, priceMax != null].filter(Boolean).length})</span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="freeOnly"
                  value="1"
                  defaultChecked={freeOnly}
                  className="rounded border-input"
                />
                Free tier available
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">From ($)</Label>
                  <Input
                    type="number"
                    name="priceMin"
                    placeholder="0"
                    min={0}
                    step={0.01}
                    defaultValue={priceMin ?? ''}
                    className="h-9 mt-0.5"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To ($)</Label>
                  <Input
                    type="number"
                    name="priceMax"
                    placeholder="Max"
                    min={0}
                    step={0.01}
                    defaultValue={priceMax ?? ''}
                    className="h-9 mt-0.5"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {PRICE_PRESETS.map((preset) => {
                  const params: Record<string, string> = {};
                  if (query) params.q = query;
                  if (sort) params.sort = sort;
                  if (category) params.category = category;
                  if (preset.min === 0 && preset.max === 0) params.freeOnly = '1';
                  if (preset.min != null) params.priceMin = String(preset.min);
                  if (preset.max != null) params.priceMax = String(preset.max);
                  const href = Object.keys(params).length ? `/marketplace?${new URLSearchParams(params)}` : '/marketplace';
                  return (
                    <a
                      key={preset.label}
                      href={href}
                      className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground"
                    >
                      {preset.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating & Quality */}
        <AccordionItem value="rating" className="border-b border-border">
          <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-3 hover:no-underline hover:text-foreground">
            Rating &amp; Quality
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {RATING_OPTIONS.map((opt) => (
                <label key={opt.value || 'any'} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    value={opt.value}
                    defaultChecked={(minRating ?? '') === opt.value || (minRating == null && opt.value === '')}
                    className="border-input"
                  />
                  {opt.label} stars
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags */}
        <AccordionItem value="tags" className="border-b border-border">
          <AccordionTrigger className="text-xs uppercase tracking-wider text-muted-foreground py-3 hover:no-underline hover:text-foreground">
            Tags
            {tags.length > 0 && (
              <span className="ml-2 text-primary">({tags.length})</span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Input
                type="text"
                name="tags"
                placeholder="e.g. payments, auth"
                defaultValue={tags.join(', ')}
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground">Comma-separated tags</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" form={standaloneForm ? undefined : formId} className="w-full">
          Apply Filters
        </Button>
        <a
          href="/marketplace"
          className="text-sm text-muted-foreground underline hover:text-foreground text-center"
        >
          Clear all filters
        </a>
      </div>
    </>
  );

  if (standaloneForm) {
    return (
      <form
        id={`${formId}-sheet`}
        action="/marketplace"
        method="get"
        className="space-y-4"
      >
        {query ? <input type="hidden" name="q" value={query} /> : null}
        <input type="hidden" name="sort" value={sort} />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {content}
      </form>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
