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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          status: 'active' | 'inactive' | 'suspended'
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'inactive' | 'suspended'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'inactive' | 'suspended'
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          business_name: string
          website: string | null
          email: string
          location: string
          industry: string
          campaign: string | null
          status: 'allocated' | 'used' | 'invalid'
          allocated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          website?: string | null
          email: string
          location: string
          industry: string
          campaign?: string | null
          status?: 'allocated' | 'used' | 'invalid'
          allocated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          website?: string | null
          email?: string
          location?: string
          industry?: string
          campaign?: string | null
          status?: 'allocated' | 'used' | 'invalid'
          allocated_at?: string
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          offer_id: string | null
          subject: string
          body: string
          follow_up: string | null
          tone: 'friendly' | 'professional' | 'direct'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          offer_id?: string | null
          subject: string
          body: string
          follow_up?: string | null
          tone?: 'friendly' | 'professional' | 'direct'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lead_id?: string | null
          offer_id?: string | null
          subject?: string
          body?: string
          follow_up?: string | null
          tone?: 'friendly' | 'professional' | 'direct'
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          link: string | null
          notes: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          link?: string | null
          notes?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          link?: string | null
          notes?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: 'lead_allocated' | 'email_generated' | 'email_saved' | 'offer_created' | 'offer_updated' | 'campaign_started'
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: 'lead_allocated' | 'email_generated' | 'email_saved' | 'offer_created' | 'offer_updated' | 'campaign_started'
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: 'lead_allocated' | 'email_generated' | 'email_saved' | 'offer_created' | 'offer_updated' | 'campaign_started'
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      usage_limits: {
        Row: {
          id: string
          user_id: string
          date: string
          leads_allocated: number
          emails_generated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          leads_allocated?: number
          emails_generated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          leads_allocated?: number
          emails_generated?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'active' | 'inactive' | 'suspended'
      lead_status: 'allocated' | 'used' | 'invalid'
      email_tone: 'friendly' | 'professional' | 'direct'
      activity_action: 'lead_allocated' | 'email_generated' | 'email_saved' | 'offer_created' | 'offer_updated' | 'campaign_started'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type Lead = Tables<'leads'>
export type EmailTemplate = Tables<'email_templates'>
export type Offer = Tables<'offers'>
export type ActivityLog = Tables<'activity_logs'>
export type UsageLimit = Tables<'usage_limits'>

export type ActivityAction = Database['public']['Tables']['activity_logs']['Row']['action']
