'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight, ArrowLeft, Check, Database, Code2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PricingPlan {
  name: string;
  price_monthly: number;
  description: string;
  included_calls: number | null;
  rate_limit_per_day: number | null;
  features: string[];
}

interface PublishWizardProps {
  categories: Category[];
}

const STEPS = ['Basic Info', 'Details', 'Pricing', 'Review'];

export function PublishWizard({ categories }: PublishWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  const [productType, setProductType] = useState<'api' | 'dataset'>('api');

  // API fields
  const [openApiRaw, setOpenApiRaw] = useState('');
  const [openApiFormat, setOpenApiFormat] = useState<'json' | 'yaml'>('json');
  const [parseError, setParseError] = useState<string | null>(null);
  const [endpointCount, setEndpointCount] = useState<number | null>(null);

  // Dataset fields
  const [dataFileFormat, setDataFileFormat] = useState('');
  const [dataSizeBytes, setDataSizeBytes] = useState('');
  const [dataUpdateFrequency, setDataUpdateFrequency] = useState('');
  const [dataDeliveryMethod, setDataDeliveryMethod] = useState<'download' | 'stream'>('download');
  const [dataSampleUrl, setDataSampleUrl] = useState('');
  const [dataLicense, setDataLicense] = useState('');
  const [dataSchemaPreview, setDataSchemaPreview] = useState('');

  const [plans, setPlans] = useState<PricingPlan[]>([
    { name: 'Free', price_monthly: 0, description: '', included_calls: 1000, rate_limit_per_day: 1000, features: [] },
  ]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const validateStep0 = () => {
    if (!name.trim()) return 'Name is required';
    if (productType === 'api' && !baseUrl.trim()) return 'Base URL is required';
    if (!slug.trim()) return 'Slug is required';
    return null;
  };

  const handleParseOpenApi = async () => {
    if (!openApiRaw.trim()) {
      setEndpointCount(0);
      setParseError(null);
      return;
    }
    setParseError(null);
    try {
      const res = await fetch('/api/parse-openapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: openApiRaw, format: openApiFormat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? 'Parse failed');
        setEndpointCount(null);
        return;
      }
      if (data.errors?.length > 0) {
        setParseError(data.errors[0]);
        setEndpointCount(null);
      } else {
        setEndpointCount(data.endpoints ?? 0);
        if (data.baseUrl && !baseUrl) setBaseUrl(data.baseUrl);
      }
    } catch {
      setParseError('Invalid spec');
      setEndpointCount(null);
    }
  };

  const addPlan = () => {
    setPlans((p) => [...p, { name: '', price_monthly: 0, description: '', included_calls: null, rate_limit_per_day: null, features: [] }]);
  };

  const removePlan = (index: number) => {
    if (plans.length <= 1) return;
    setPlans((p) => p.filter((_, i) => i !== index));
  };

  const updatePlan = (index: number, field: keyof PricingPlan, value: any) => {
    setPlans((p) => {
      const next = [...p];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handlePublish = async () => {
    const err = validateStep0();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          category_id: categoryId || undefined,
          short_description: shortDescription.trim() || undefined,
          description: description.trim() || undefined,
          base_url: baseUrl.trim(),
          product_type: productType,
          ...(productType === 'dataset' ? {
            dataset_metadata: {
              file_format: dataFileFormat.trim() || undefined,
              file_size_bytes: dataSizeBytes ? Number(dataSizeBytes) : undefined,
              update_frequency: dataUpdateFrequency.trim() || undefined,
              delivery_method: dataDeliveryMethod,
              sample_url: dataSampleUrl.trim() || undefined,
              license: dataLicense.trim() || undefined,
              schema_preview: dataSchemaPreview.trim() || undefined,
            },
          } : {
            openapi_raw: openApiRaw.trim() || undefined,
            openapi_format: openApiFormat,
          }),
          pricing_plans: plans.map((p) => ({
            name: p.name || 'Plan',
            price_monthly: p.price_monthly ?? 0,
            description: p.description || null,
            included_calls: p.included_calls,
            rate_limit_per_day: p.rate_limit_per_day,
            features: p.features.length ? p.features : null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create API');
        setLoading(false);
        return;
      }
      const apiId = data.api?.id;
      if (apiId) {
        const pubRes = await fetch(`/api/apis/${apiId}/publish`, { method: 'POST' });
        if (pubRes.ok) {
          router.push('/dashboard/provider/apis');
          return;
        }
        router.push(`/dashboard/provider/apis/${apiId}`);
      }
      router.push('/dashboard/provider/apis');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-1 text-sm ${i <= step ? 'font-medium text-primary' : 'text-muted-foreground'}`}
            >
              {i > 0 && <span className="mr-1">→</span>}
              {s}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            {/* Product type toggle */}
            <div>
              <Label>Product Type</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setProductType('api')}
                  className={`flex-1 flex items-center gap-2 justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    productType === 'api'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Code2 className="h-4 w-4" /> API
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('dataset')}
                  className={`flex-1 flex items-center gap-2 justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    productType === 'dataset'
                      ? 'border-teal-600 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Database className="h-4 w-4" /> Dataset
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="name">{productType === 'dataset' ? 'Dataset' : 'API'} Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My API"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL-friendly)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-api"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {productType === 'api' && (
              <div>
                <Label htmlFor="base_url">Base URL</Label>
                <Input
                  id="base_url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>
            )}
            <div>
              <Label htmlFor="short_desc">Short description</Label>
              <Input
                id="short_desc"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One-line description"
              />
            </div>
            <div>
              <Label htmlFor="desc">Full description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your API..."
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 1 && productType === 'api' && (
          <div className="space-y-4">
            <div>
              <Label>OpenAPI spec (optional)</Label>
              <Select value={openApiFormat} onValueChange={(v: 'json' | 'yaml') => setOpenApiFormat(v)}>
                <SelectTrigger className="mt-2 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                className="mt-2 font-mono text-sm min-h-[200px]"
                value={openApiRaw}
                onChange={(e) => setOpenApiRaw(e.target.value)}
                onBlur={handleParseOpenApi}
                placeholder={openApiFormat === 'json' ? '{"openapi": "3.0.0", ...}' : 'openapi: 3.0.0\n...'}
              />
              {parseError && <p className="text-sm text-destructive mt-1">{parseError}</p>}
              {endpointCount !== null && !parseError && (
                <p className="text-sm text-muted-foreground mt-1">{endpointCount} endpoints detected</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && productType === 'dataset' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Provide metadata about your dataset so buyers can evaluate it before subscribing.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>File format</Label>
                <Input value={dataFileFormat} onChange={(e) => setDataFileFormat(e.target.value)} placeholder="CSV, JSON, Parquet…" className="mt-1" />
              </div>
              <div>
                <Label>File size (bytes)</Label>
                <Input type="number" min={0} value={dataSizeBytes} onChange={(e) => setDataSizeBytes(e.target.value)} placeholder="e.g. 104857600" className="mt-1" />
              </div>
              <div>
                <Label>Update frequency</Label>
                <Input value={dataUpdateFrequency} onChange={(e) => setDataUpdateFrequency(e.target.value)} placeholder="Daily, Weekly, Static…" className="mt-1" />
              </div>
              <div>
                <Label>Delivery method</Label>
                <Select value={dataDeliveryMethod} onValueChange={(v: 'download' | 'stream') => setDataDeliveryMethod(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sample / download URL</Label>
                <Input value={dataSampleUrl} onChange={(e) => setDataSampleUrl(e.target.value)} placeholder="https://…" className="mt-1" />
              </div>
              <div>
                <Label>License</Label>
                <Input value={dataLicense} onChange={(e) => setDataLicense(e.target.value)} placeholder="CC BY 4.0, MIT, Proprietary…" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Schema preview (optional)</Label>
              <Textarea
                className="mt-1 font-mono text-sm"
                rows={6}
                value={dataSchemaPreview}
                onChange={(e) => setDataSchemaPreview(e.target.value)}
                placeholder={'{"fields": [{"name": "id", "type": "integer"}, …]}'}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {plans.map((plan, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Plan {i + 1}</span>
                    {plans.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePlan(i)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={plan.name}
                        onChange={(e) => updatePlan(i, 'name', e.target.value)}
                        placeholder="Free / Pro / Enterprise"
                      />
                    </div>
                    <div>
                      <Label>Price (USD/mo)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={plan.price_monthly}
                        onChange={(e) => updatePlan(i, 'price_monthly', Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={plan.description}
                      onChange={(e) => updatePlan(i, 'description', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Included calls (optional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={plan.included_calls ?? ''}
                        onChange={(e) => updatePlan(i, 'included_calls', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label>Rate limit per day (optional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={plan.rate_limit_per_day ?? ''}
                        onChange={(e) => updatePlan(i, 'rate_limit_per_day', e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addPlan}>
              Add plan
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                {productType === 'dataset' ? <Database className="h-4 w-4 text-teal-600" /> : <Code2 className="h-4 w-4 text-primary" />}
                <h3 className="font-semibold">{name || 'Name'}</h3>
                <span className="text-xs text-muted-foreground capitalize px-1.5 py-0.5 rounded bg-muted">{productType}</span>
              </div>
              <p className="text-sm text-muted-foreground">{shortDescription || 'No description'}</p>
              {productType === 'api' && (
                <>
                  <p className="text-xs text-muted-foreground">Base URL: {baseUrl}</p>
                  <p className="text-xs text-muted-foreground">
                    {endpointCount != null ? `${endpointCount} endpoints` : 'No OpenAPI'} · {plans.length} plan(s)
                  </p>
                </>
              )}
              {productType === 'dataset' && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {dataFileFormat && <p>Format: {dataFileFormat}</p>}
                  {dataUpdateFrequency && <p>Update frequency: {dataUpdateFrequency}</p>}
                  {dataDeliveryMethod && <p>Delivery: {dataDeliveryMethod}</p>}
                  <p>{plans.length} pricing plan(s)</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                if (step === 0 && validateStep0()) setError(validateStep0());
                else setError(null);
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Publish API
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
