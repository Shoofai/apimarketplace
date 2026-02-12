export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_categories: {
        Row: {
          api_count: number | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          api_count?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          api_count?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "api_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      api_endpoints: {
        Row: {
          api_id: string
          api_version_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_deprecated: boolean | null
          method: string
          parameters: Json | null
          path: string
          request_body: Json | null
          responses: Json | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          api_id: string
          api_version_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_deprecated?: boolean | null
          method: string
          parameters?: Json | null
          path: string
          request_body?: Json | null
          responses?: Json | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string
          api_version_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_deprecated?: boolean | null
          method?: string
          parameters?: Json | null
          path?: string
          request_body?: Json | null
          responses?: Json | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_endpoints_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_endpoints_api_version_id_fkey"
            columns: ["api_version_id"]
            isOneToOne: false
            referencedRelation: "api_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_pricing_plans: {
        Row: {
          api_id: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          included_calls: number | null
          is_active: boolean | null
          is_custom: boolean | null
          name: string
          price_monthly: number | null
          price_per_call: number | null
          rate_limit_per_day: number | null
          rate_limit_per_month: number | null
          rate_limit_per_second: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          api_id: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          included_calls?: number | null
          is_active?: boolean | null
          is_custom?: boolean | null
          name: string
          price_monthly?: number | null
          price_per_call?: number | null
          rate_limit_per_day?: number | null
          rate_limit_per_month?: number | null
          rate_limit_per_second?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          included_calls?: number | null
          is_active?: boolean | null
          is_custom?: boolean | null
          name?: string
          price_monthly?: number | null
          price_per_call?: number | null
          rate_limit_per_day?: number | null
          rate_limit_per_month?: number | null
          rate_limit_per_second?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_pricing_plans_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      api_reviews: {
        Row: {
          api_id: string
          body: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_id: string
          body?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_id?: string
          body?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_reviews_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_subscriptions: {
        Row: {
          api_id: string
          api_key: string
          api_key_prefix: string
          calls_this_month: number | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          pricing_plan_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_id: string
          api_key: string
          api_key_prefix: string
          calls_this_month?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          organization_id: string
          pricing_plan_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_id?: string
          api_key?: string
          api_key_prefix?: string
          calls_this_month?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          pricing_plan_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_subscriptions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_subscriptions_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "api_pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_versions: {
        Row: {
          api_id: string
          changelog: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          openapi_spec: Json | null
          status: string | null
          version: string
        }
        Insert: {
          api_id: string
          changelog?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          openapi_spec?: Json | null
          status?: string | null
          version: string
        }
        Update: {
          api_id?: string
          changelog?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          openapi_spec?: Json | null
          status?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_versions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      apis: {
        Row: {
          avg_rating: number | null
          base_url: string
          category_id: string | null
          created_at: string | null
          description: string | null
          gateway_service_id: string | null
          id: string
          logo_url: string | null
          long_description: string | null
          name: string
          openapi_raw: string | null
          openapi_spec: Json | null
          organization_id: string
          published_at: string | null
          settings: Json | null
          slug: string
          status: string | null
          tags: string[] | null
          total_api_calls: number | null
          total_reviews: number | null
          total_subscribers: number | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          avg_rating?: number | null
          base_url: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          gateway_service_id?: string | null
          id?: string
          logo_url?: string | null
          long_description?: string | null
          name: string
          openapi_raw?: string | null
          openapi_spec?: Json | null
          organization_id: string
          published_at?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          tags?: string[] | null
          total_api_calls?: number | null
          total_reviews?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          avg_rating?: number | null
          base_url?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          gateway_service_id?: string | null
          id?: string
          logo_url?: string | null
          long_description?: string | null
          name?: string
          openapi_raw?: string | null
          openapi_spec?: Json | null
          organization_id?: string
          published_at?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          total_api_calls?: number | null
          total_reviews?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apis_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "api_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_clicks: {
        Row: {
          created_at: string | null
          cta_location: string
          cta_type: string
          id: string
          metadata: Json | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          cta_location: string
          cta_type: string
          id?: string
          metadata?: Json | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          cta_location?: string
          cta_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string
        }
        Relationships: []
      }
      feature_demo_interactions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          feature_id: number
          feature_name: string
          id: string
          interaction_type: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          feature_id: number
          feature_name: string
          id?: string
          interaction_type?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          feature_id?: number
          feature_name?: string
          id?: string
          interaction_type?: string | null
          session_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled_for_orgs: string[] | null
          enabled_for_plans: string[] | null
          enabled_globally: boolean | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          enabled_globally?: boolean | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          enabled_globally?: boolean | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      gdpr_consent_logs: {
        Row: {
          consent_preferences: Json
          consent_version: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_preferences: Json
          consent_version: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_preferences?: Json
          consent_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      implementation_sprints: {
        Row: {
          completed_at: string | null
          created_at: string | null
          dependencies: number[] | null
          description: string | null
          duration_weeks: number
          id: string
          name: string
          notes: string | null
          phase: string
          sprint_number: number
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          dependencies?: number[] | null
          description?: string | null
          duration_weeks: number
          id?: string
          name: string
          notes?: string | null
          phase: string
          sprint_number: number
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          dependencies?: number[] | null
          description?: string | null
          duration_weeks?: number
          id?: string
          name?: string
          notes?: string | null
          phase?: string
          sprint_number?: number
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          company_size: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          primary_goal: string | null
          role: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          primary_goal?: string | null
          role?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          primary_goal?: string | null
          role?: string | null
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role: string
          status?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          plan: string | null
          settings: Json | null
          slug: string
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          plan?: string | null
          settings?: Json | null
          slug: string
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          page_path: string
          referrer: string | null
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          scroll_depth?: number | null
          session_id: string
          time_on_page?: number | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          created_at: string | null
          display_name: string
          documentation_url: string | null
          id: string
          is_verified: boolean | null
          long_description: string | null
          organization_id: string
          social_links: Json | null
          support_email: string | null
          support_url: string | null
          tagline: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          documentation_url?: string | null
          id?: string
          is_verified?: boolean | null
          long_description?: string | null
          organization_id: string
          social_links?: Json | null
          support_email?: string | null
          support_url?: string | null
          tagline?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          documentation_url?: string | null
          id?: string
          is_verified?: boolean | null
          long_description?: string | null
          organization_id?: string
          social_links?: Json | null
          support_email?: string | null
          support_url?: string | null
          tagline?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_deliverables: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          name: string
          sprint_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          sprint_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_deliverables_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "implementation_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          sprint_id: string
          status: string | null
          task_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          sprint_id: string
          status?: string | null
          task_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          sprint_id?: string
          status?: string | null
          task_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprint_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "implementation_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_organization_id: string | null
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          metadata: Json | null
          referral_source: string | null
          role: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          referral_source?: string | null
          role?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          referral_source?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
