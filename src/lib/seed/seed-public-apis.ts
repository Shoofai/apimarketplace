/**
 * Seed script for 50–100 preloaded public APIs (unclaimed, visible in marketplace).
 *
 * Usage: npx tsx src/lib/seed/seed-public-apis.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && !process.env[key]) process.env[key] = value;
      }
    });
  } catch {
    // Use existing process.env
  }
}

loadEnv();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

interface PublicApi {
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  base_url: string;
}

const PUBLIC_APIS: PublicApi[] = [
  // Weather (5-8)
  {
    name: 'OpenWeatherMap',
    slug: 'openweathermap',
    description: 'Weather data including current conditions, forecasts, and historical data. Free tier available.',
    category: 'Weather',
    url: 'https://openweathermap.org/api',
    base_url: 'https://api.openweathermap.org',
  },
  {
    name: 'Weatherstack',
    slug: 'weatherstack',
    description: 'Real-time and historical weather data API. 14-day forecast support.',
    category: 'Weather',
    url: 'https://weatherstack.com/documentation',
    base_url: 'http://api.weatherstack.com',
  },
  {
    name: 'Visual Crossing Weather',
    slug: 'visual-crossing-weather',
    description: 'Historical weather data and forecasts. Solar and precipitation data.',
    category: 'Weather',
    url: 'https://www.visualcrossing.com/weather-api',
    base_url: 'https://weather.visualcrossing.com',
  },
  {
    name: 'WeatherAPI',
    slug: 'weatherapi',
    description: 'Free weather and forecast API. Realtime, forecast, astronomy, and time zone.',
    category: 'Weather',
    url: 'https://www.weatherapi.com/docs/',
    base_url: 'https://api.weatherapi.com',
  },
  {
    name: 'Open-Meteo',
    slug: 'open-meteo',
    description: 'Free weather API with no API key required. Open data from national weather services.',
    category: 'Weather',
    url: 'https://open-meteo.com/en/docs',
    base_url: 'https://api.open-meteo.com',
  },
  // Finance (5-8)
  {
    name: 'Stripe',
    slug: 'stripe',
    description: 'Online payment processing for internet businesses. Payments, subscriptions, invoicing.',
    category: 'Finance',
    url: 'https://stripe.com/docs/api',
    base_url: 'https://api.stripe.com',
  },
  {
    name: 'Plaid',
    slug: 'plaid',
    description: 'Connect user bank accounts to your app. Auth, Balance, Transactions, Identity.',
    category: 'Finance',
    url: 'https://plaid.com/docs/api/',
    base_url: 'https://api.plaid.com',
  },
  {
    name: 'CoinGecko',
    slug: 'coingecko',
    description: 'Cryptocurrency prices, market data, and exchange information. Free tier available.',
    category: 'Finance',
    url: 'https://www.coingecko.com/en/api/documentation',
    base_url: 'https://api.coingecko.com',
  },
  {
    name: 'Alpha Vantage',
    slug: 'alpha-vantage',
    description: 'Stock, forex, and crypto market data. Technical indicators and fundamental data.',
    category: 'Finance',
    url: 'https://www.alphavantage.co/documentation/',
    base_url: 'https://www.alphavantage.co',
  },
  {
    name: 'Fixer',
    slug: 'fixer',
    description: 'Currency exchange rates API. 170+ currencies, historical data.',
    category: 'Finance',
    url: 'https://fixer.io/documentation',
    base_url: 'https://api.fixer.io',
  },
  {
    name: 'ExchangeRate-API',
    slug: 'exchangerate-api',
    description: 'Free currency conversion and exchange rates. No API key required for limited use.',
    category: 'Finance',
    url: 'https://www.exchangerate-api.com/docs',
    base_url: 'https://v6.exchangerate-api.com',
  },
  // Development (5-8)
  {
    name: 'GitHub',
    slug: 'github',
    description: 'REST API for repositories, issues, pull requests, and GitHub Actions.',
    category: 'Development',
    url: 'https://docs.github.com/en/rest',
    base_url: 'https://api.github.com',
  },
  {
    name: 'GitLab',
    slug: 'gitlab',
    description: 'Manage projects, issues, merge requests, and CI/CD pipelines.',
    category: 'Development',
    url: 'https://docs.gitlab.com/ee/api/',
    base_url: 'https://gitlab.com/api/v4',
  },
  {
    name: 'Bitbucket',
    slug: 'bitbucket',
    description: 'Atlassian Bitbucket Cloud API for repositories and pull requests.',
    category: 'Development',
    url: 'https://developer.atlassian.com/cloud/bitbucket/rest/',
    base_url: 'https://api.bitbucket.org/2.0',
  },
  {
    name: 'Postman',
    slug: 'postman',
    description: 'Manage Postman workspaces, collections, and monitors programmatically.',
    category: 'Development',
    url: 'https://www.postman.com/postman/workspace/postman-public-workspace/overview',
    base_url: 'https://api.getpostman.com',
  },
  {
    name: 'Vercel',
    slug: 'vercel',
    description: 'Deploy and manage Vercel projects, domains, and deployments.',
    category: 'Development',
    url: 'https://vercel.com/docs/rest-api',
    base_url: 'https://api.vercel.com',
  },
  {
    name: 'Render',
    slug: 'render',
    description: 'Manage Render services, environments, and deployments via API.',
    category: 'Development',
    url: 'https://api-docs.render.com/',
    base_url: 'https://api.render.com',
  },
  // Data (5-8)
  {
    name: 'REST Countries',
    slug: 'rest-countries',
    description: 'Country data including name, capital, languages, currency. No API key required.',
    category: 'Data',
    url: 'https://restcountries.com/',
    base_url: 'https://restcountries.com',
  },
  {
    name: 'IP Geolocation',
    slug: 'ip-geolocation',
    description: 'IP address to location, timezone, and ISP. Multiple provider options available.',
    category: 'Data',
    url: 'https://ip-api.com/docs',
    base_url: 'http://ip-api.com',
  },
  {
    name: 'Abstract API',
    slug: 'abstract-api',
    description: 'Email validation, geolocation, and various data APIs in one platform.',
    category: 'Data',
    url: 'https://www.abstractapi.com/api',
    base_url: 'https://emailvalidation.abstractapi.com',
  },
  {
    name: 'JSONPlaceholder',
    slug: 'jsonplaceholder',
    description: 'Fake REST API for testing and prototyping. Posts, users, todos.',
    category: 'Data',
    url: 'https://jsonplaceholder.typicode.com/',
    base_url: 'https://jsonplaceholder.typicode.com',
  },
  {
    name: 'Random User',
    slug: 'random-user',
    description: 'Generate random user data for demos and testing.',
    category: 'Data',
    url: 'https://randomuser.me/documentation',
    base_url: 'https://randomuser.me/api',
  },
  {
    name: 'Bored API',
    slug: 'bored-api',
    description: 'Find random activities when you are bored. No authentication required.',
    category: 'Data',
    url: 'https://www.boredapi.com/documentation',
    base_url: 'https://www.boredapi.com/api',
  },
  // Communication (5-8)
  {
    name: 'Twilio',
    slug: 'twilio',
    description: 'SMS, voice, and messaging APIs. Build contact centers and communication apps.',
    category: 'Communication',
    url: 'https://www.twilio.com/docs/api',
    base_url: 'https://api.twilio.com',
  },
  {
    name: 'SendGrid',
    slug: 'sendgrid',
    description: 'Email delivery API. Transactional and marketing email.',
    category: 'Communication',
    url: 'https://docs.sendgrid.com/api-reference/',
    base_url: 'https://api.sendgrid.com',
  },
  {
    name: 'Mailchimp',
    slug: 'mailchimp',
    description: 'Email marketing and automation. Manage lists, campaigns, and audiences.',
    category: 'Communication',
    url: 'https://mailchimp.com/developer/marketing/api/',
    base_url: 'https://us1.api.mailchimp.com/3.0',
  },
  {
    name: 'Discord',
    slug: 'discord',
    description: 'Bot and application API for Discord. Messages, channels, guilds.',
    category: 'Communication',
    url: 'https://discord.com/developers/docs/intro',
    base_url: 'https://discord.com/api',
  },
  {
    name: 'Slack',
    slug: 'slack',
    description: 'Post messages, manage channels, and automate Slack workflows.',
    category: 'Communication',
    url: 'https://api.slack.com/',
    base_url: 'https://slack.com/api',
  },
  {
    name: 'Vonage',
    slug: 'vonage',
    description: 'SMS, voice, and video APIs. Formerly Nexmo.',
    category: 'Communication',
    url: 'https://developer.vonage.com/api',
    base_url: 'https://api.nexmo.com',
  },
  // AI/ML (3-5)
  {
    name: 'OpenAI',
    slug: 'openai',
    description: 'GPT models, embeddings, and image generation. ChatGPT, DALL-E.',
    category: 'AI/ML',
    url: 'https://platform.openai.com/docs/api-reference',
    base_url: 'https://api.openai.com',
  },
  {
    name: 'Hugging Face',
    slug: 'hugging-face',
    description: 'Access thousands of ML models. Inference API for NLP and vision.',
    category: 'AI/ML',
    url: 'https://huggingface.co/docs/api-inference/',
    base_url: 'https://api-inference.huggingface.co',
  },
  {
    name: 'Cohere',
    slug: 'cohere',
    description: 'NLP API for embeddings, classification, summarization, and chat.',
    category: 'AI/ML',
    url: 'https://docs.cohere.com/reference',
    base_url: 'https://api.cohere.ai',
  },
  {
    name: 'Anthropic',
    slug: 'anthropic',
    description: 'Claude models for text generation, analysis, and reasoning.',
    category: 'AI/ML',
    url: 'https://docs.anthropic.com/en/api',
    base_url: 'https://api.anthropic.com',
  },
  {
    name: 'Replicate',
    slug: 'replicate',
    description: 'Run thousands of open-source ML models. Image, audio, video generation.',
    category: 'AI/ML',
    url: 'https://replicate.com/docs/reference/http',
    base_url: 'https://api.replicate.com',
  },
  // Maps/Geo (3-5)
  {
    name: 'OpenStreetMap',
    slug: 'openstreetmap',
    description: 'Geocoding, routing, and map data. Nominatim and Overpass APIs.',
    category: 'Maps/Geo',
    url: 'https://nominatim.org/release-docs/latest/api/Overview/',
    base_url: 'https://nominatim.openstreetmap.org',
  },
  {
    name: 'Mapbox',
    slug: 'mapbox',
    description: 'Maps, geocoding, directions, and spatial data.',
    category: 'Maps/Geo',
    url: 'https://docs.mapbox.com/api/',
    base_url: 'https://api.mapbox.com',
  },
  {
    name: 'OpenCage',
    slug: 'opencage',
    description: 'Forward and reverse geocoding. Global coverage.',
    category: 'Maps/Geo',
    url: 'https://opencagedata.com/api',
    base_url: 'https://api.opencagedata.com',
  },
  {
    name: 'LocationIQ',
    slug: 'locationiq',
    description: 'Geocoding and maps. Free tier for developers.',
    category: 'Maps/Geo',
    url: 'https://locationiq.com/docs',
    base_url: 'https://us1.locationiq.com',
  },
  // Social (3-5)
  {
    name: 'Reddit',
    slug: 'reddit',
    description: 'Access Reddit posts, comments, and subreddits. OAuth required.',
    category: 'Social',
    url: 'https://www.reddit.com/dev/api/',
    base_url: 'https://oauth.reddit.com',
  },
  {
    name: 'Mastodon',
    slug: 'mastodon',
    description: 'Federated social network API. Posts, timelines, and instances.',
    category: 'Social',
    url: 'https://docs.joinmastodon.org/api/',
    base_url: 'https://mastodon.social/api/v1',
  },
  {
    name: 'LinkedIn',
    slug: 'linkedin',
    description: 'Profile, company, and marketing APIs. OAuth 2.0.',
    category: 'Social',
    url: 'https://developer.linkedin.com/docs',
    base_url: 'https://api.linkedin.com',
  },
  {
    name: 'Pinterest',
    slug: 'pinterest',
    description: 'Pins, boards, and user data. Marketing API available.',
    category: 'Social',
    url: 'https://developers.pinterest.com/docs/api/v5/',
    base_url: 'https://api.pinterest.com/v5',
  },
  // E-commerce (3-5)
  {
    name: 'Shopify',
    slug: 'shopify',
    description: 'Manage products, orders, customers. Storefront and Admin APIs.',
    category: 'E-commerce',
    url: 'https://shopify.dev/docs/api',
    base_url: 'https://{shop}.myshopify.com/admin/api',
  },
  {
    name: 'WooCommerce',
    slug: 'woocommerce',
    description: 'REST API for WordPress WooCommerce. Products, orders, customers.',
    category: 'E-commerce',
    url: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    base_url: 'https://example.com/wp-json/wc/v3',
  },
  {
    name: 'Square',
    slug: 'square',
    description: 'Payments, orders, and catalog management for sellers.',
    category: 'E-commerce',
    url: 'https://developer.squareup.com/reference/square',
    base_url: 'https://connect.squareup.com',
  },
  {
    name: 'Etsy',
    slug: 'etsy',
    description: 'Open API for Etsy sellers. Listings, orders, and shop management.',
    category: 'E-commerce',
    url: 'https://developers.etsy.com/documentation/reference',
    base_url: 'https://openapi.etsy.com/v3',
  },
  // Other (5-10)
  {
    name: 'Unsplash',
    slug: 'unsplash',
    description: 'High-quality stock photos. Free for use with attribution.',
    category: 'Other',
    url: 'https://unsplash.com/developers',
    base_url: 'https://api.unsplash.com',
  },
  {
    name: 'Giphy',
    slug: 'giphy',
    description: 'GIF search and stickers. Embed in apps and websites.',
    category: 'Other',
    url: 'https://developers.giphy.com/docs/api/',
    base_url: 'https://api.giphy.com/v1',
  },
  {
    name: 'Spotify',
    slug: 'spotify',
    description: 'Music metadata, playlists, and playback control.',
    category: 'Other',
    url: 'https://developer.spotify.com/documentation/web-api',
    base_url: 'https://api.spotify.com/v1',
  },
  {
    name: 'YouTube Data',
    slug: 'youtube-data',
    description: 'Search videos, channels, and playlists. Analytics for creators.',
    category: 'Other',
    url: 'https://developers.google.com/youtube/v3',
    base_url: 'https://www.googleapis.com/youtube/v3',
  },
  {
    name: 'The Cat API',
    slug: 'the-cat-api',
    description: 'Random cat images and facts. No API key required for limited use.',
    category: 'Other',
    url: 'https://thecatapi.com/',
    base_url: 'https://api.thecatapi.com/v1',
  },
  {
    name: 'Dog CEO',
    slug: 'dog-ceo',
    description: 'Random dog images by breed. Free, no API key.',
    category: 'Other',
    url: 'https://dog.ceo/dog-api/',
    base_url: 'https://dog.ceo/api',
  },
  {
    name: 'NASA',
    slug: 'nasa',
    description: 'NASA APIs for astronomy, Earth imagery, and Mars rover photos.',
    category: 'Other',
    url: 'https://api.nasa.gov/',
    base_url: 'https://api.nasa.gov',
  },
  {
    name: 'PokeAPI',
    slug: 'pokeapi',
    description: 'Pokémon data - species, moves, items. Free and open.',
    category: 'Other',
    url: 'https://pokeapi.co/docs/v2',
    base_url: 'https://pokeapi.co/api/v2',
  },
  {
    name: 'News API',
    slug: 'news-api',
    description: 'Search and retrieve news articles from global sources.',
    category: 'Other',
    url: 'https://newsapi.org/docs',
    base_url: 'https://newsapi.org/v2',
  },
  {
    name: 'Lego',
    slug: 'lego-api',
    description: 'LEGO set and part database. Bricklink-style data.',
    category: 'Other',
    url: 'https://lego-api.herokuapp.com/',
    base_url: 'https://lego-api.herokuapp.com/api/v1',
  },
];

const PLATFORM_ORG_SLUG = 'platform-directory';

async function main() {
  const admin = createAdminClient();

  // 1. Get or create platform org
  const { data: platformOrg, error: orgErr } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', PLATFORM_ORG_SLUG)
    .maybeSingle();

  if (orgErr) {
    console.error('Failed to fetch platform org:', orgErr);
    process.exit(1);
  }

  let platformOrgId: string;
  if (platformOrg) {
    platformOrgId = platformOrg.id;
    console.log('Using existing platform org:', platformOrgId);
  } else {
    const { data: newOrg, error: insertErr } = await admin
      .from('organizations')
      .insert({
        name: 'API Directory',
        slug: PLATFORM_ORG_SLUG,
        type: 'provider',
        description: 'Preloaded API listings available for providers to claim and publish',
      })
      .select('id')
      .single();
    if (insertErr) {
      console.error('Failed to create platform org:', insertErr);
      process.exit(1);
    }
    platformOrgId = newOrg!.id;
    console.log('Created platform org:', platformOrgId);
  }

  // 2. Build category slug -> id map (get or create)
  const categoryNames = [...new Set(PUBLIC_APIS.map((a) => a.category))];
  const categoryMap: Record<string, string> = {};

  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: cat } = await admin
      .from('api_categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (cat) {
      categoryMap[name] = cat.id;
    } else {
      const { data: newCat, error } = await admin
        .from('api_categories')
        .insert({ name, slug })
        .select('id')
        .single();
      if (error) {
        console.warn('Could not create category', name, error.message);
        continue;
      }
      categoryMap[name] = newCat!.id;
    }
  }

  let created = 0;
  let updated = 0;

  for (const api of PUBLIC_APIS) {
    const categoryId = categoryMap[api.category] ?? null;
    const { data: existing } = await admin
      .from('apis')
      .select('id, status')
      .eq('organization_id', platformOrgId)
      .eq('slug', api.slug)
      .maybeSingle();

    const payload = {
      name: api.name,
      slug: api.slug,
      description: api.description,
      organization_id: platformOrgId,
      base_url: api.base_url,
      original_url: api.url,
      status: 'unclaimed',
      visibility: 'public',
      category_id: categoryId,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await admin
        .from('apis')
        .update(payload)
        .eq('id', existing.id);
      if (error) {
        console.warn('Failed to update', api.slug, error.message);
        continue;
      }
      updated++;
    } else {
      const { error } = await admin.from('apis').insert({
        ...payload,
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.warn('Failed to insert', api.slug, error.message);
        continue;
      }
      created++;
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}, Total: ${PUBLIC_APIS.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
