export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          image: string | null
          images: string[] | null

          price: string | null
          discount_price: string | null
          affiliate_url: string
          category: string | null
          badge: string | null
          hook: string | null
          clicks: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          image?: string | null
          images?: string[] | null

          price?: string | null
          discount_price?: string | null
          affiliate_url: string
          category?: string | null
          badge?: string | null
          hook?: string | null
          clicks?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          image?: string | null
          images?: string[] | null

          price?: string | null
          discount_price?: string | null
          affiliate_url?: string
          category?: string | null
          badge?: string | null
          hook?: string | null
          clicks?: number
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
