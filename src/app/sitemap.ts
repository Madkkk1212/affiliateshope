import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'http://rekomendasi-luma.my.id'

  // Fetch all hooks with their images
  const { data: hooks } = await supabase
    .from('hooks')
    .select('slug, updated_at, hook_images(image_url)')

  // Fetch all products with their images
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at, image')

  const hookUrls = (hooks || []).map((hook) => ({
    url: `${baseUrl}/${hook.slug}`,
    lastModified: hook.updated_at ? new Date(hook.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
    images: hook.hook_images?.map((img: any) => img.image_url).filter(Boolean) || [],
  }))

  const productUrls = (products || []).map((product) => ({
    url: `${baseUrl}/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    images: product.image ? [product.image] : [],
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...hookUrls,
    ...productUrls,
  ]
}
