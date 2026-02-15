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
      affiliate_links: {
        Row: {
          code: string
          commission_percent: number
          created_at: string | null
          id: string
          organization_id: string
        }
        Insert: {
          code: string
          commission_percent?: number
          created_at?: string | null
          id?: string
          organization_id: string
        }
        Update: {
          code?: string
          commission_percent?: number
          created_at?: string | null
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_snippets: {
        Row: {
          api_id: string | null
          code: string
          created_at: string | null
          description: string | null
          fork_count: number | null
          id: string
          is_public: boolean | null
          language: string
          organization_id: string
          session_id: string | null
          share_slug: string | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          api_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          fork_count?: number | null
          id?: string
          is_public?: boolean | null
          language: string
          organization_id: string
          session_id?: string | null
          share_slug?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          api_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          fork_count?: number | null
          id?: string
          is_public?: boolean | null
          language?: string
          organization_id?: string
          session_id?: string | null
          share_slug?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_snippets_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_snippets_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_snippets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_snippets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_playground_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_snippets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_playground_sessions: {
        Row: {
          api_id: string | null
          created_at: string | null
          id: string
          language: string | null
          messages: Json | null
          organization_id: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_id?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          messages?: Json | null
          organization_id: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_id?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          messages?: Json | null
          organization_id?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_playground_sessions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_playground_sessions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_playground_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_playground_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_tracking: {
        Row: {
          cost_usd: number
          created_at: string | null
          feature: string
          id: string
          input_tokens: number
          model: string
          organization_id: string
          output_tokens: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          cost_usd: number
          created_at?: string | null
          feature: string
          id?: string
          input_tokens: number
          model: string
          organization_id: string
          output_tokens: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          model?: string
          organization_id?: string
          output_tokens?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_tracking_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_playground_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_deliveries: {
        Row: {
          acknowledged_at: string | null
          alert_rule_id: string
          channel_type: string
          id: string
          sent_at: string | null
          status: string | null
          target: string
          violation_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_rule_id: string
          channel_type: string
          id?: string
          sent_at?: string | null
          status?: string | null
          target: string
          violation_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_rule_id?: string
          channel_type?: string
          id?: string
          sent_at?: string | null
          status?: string | null
          target?: string
          violation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_deliveries_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_deliveries_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "sla_violations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          alert_type: string
          api_id: string | null
          channels: Json
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          api_id?: string | null
          channels: Json
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          api_id?: string | null
          channels?: Json
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rules_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      api_collection_items: {
        Row: {
          api_id: string
          collection_id: string
          created_at: string | null
          id: string
          sort_order: number
        }
        Insert: {
          api_id: string
          collection_id: string
          created_at?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          api_id?: string
          collection_id?: string
          created_at?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_collection_items_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_collection_items_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "api_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      api_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean
          name: string
          slug: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_compatibility_map: {
        Row: {
          auto_generated: boolean | null
          compatibility_score: number | null
          created_at: string | null
          endpoint_mappings: Json
          id: string
          source_api_id: string
          target_api_id: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          compatibility_score?: number | null
          created_at?: string | null
          endpoint_mappings: Json
          id?: string
          source_api_id: string
          target_api_id: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          compatibility_score?: number | null
          created_at?: string | null
          endpoint_mappings?: Json
          id?: string
          source_api_id?: string
          target_api_id?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_compatibility_map_source_api_id_fkey"
            columns: ["source_api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_compatibility_map_source_api_id_fkey"
            columns: ["source_api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_compatibility_map_target_api_id_fkey"
            columns: ["target_api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_compatibility_map_target_api_id_fkey"
            columns: ["target_api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_compatibility_map_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_contracts: {
        Row: {
          api_id: string
          api_version_id: string | null
          created_at: string | null
          endpoint_id: string | null
          expected_headers: Json | null
          expected_response_schema: Json | null
          expected_status_codes: number[] | null
          id: string
          is_active: boolean | null
          max_latency_ms: number | null
          updated_at: string | null
        }
        Insert: {
          api_id: string
          api_version_id?: string | null
          created_at?: string | null
          endpoint_id?: string | null
          expected_headers?: Json | null
          expected_response_schema?: Json | null
          expected_status_codes?: number[] | null
          id?: string
          is_active?: boolean | null
          max_latency_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string
          api_version_id?: string | null
          created_at?: string | null
          endpoint_id?: string | null
          expected_headers?: Json | null
          expected_response_schema?: Json | null
          expected_status_codes?: number[] | null
          id?: string
          is_active?: boolean | null
          max_latency_ms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_contracts_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_contracts_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_contracts_api_version_id_fkey"
            columns: ["api_version_id"]
            isOneToOne: false
            referencedRelation: "api_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_contracts_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
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
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
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
      api_favorites: {
        Row: {
          api_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          api_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          api_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_favorites_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_favorites_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_health_checks: {
        Row: {
          api_id: string
          checked_at: string | null
          error_message: string | null
          id: string
          is_healthy: boolean | null
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          api_id: string
          checked_at?: string | null
          error_message?: string | null
          id?: string
          is_healthy?: boolean | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          api_id?: string
          checked_at?: string | null
          error_message?: string | null
          id?: string
          is_healthy?: boolean | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_health_checks_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_health_checks_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      api_incidents: {
        Row: {
          api_id: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string | null
          started_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          api_id?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string | null
          started_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          api_id?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_incidents_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_incidents_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit_override: number | null
          revoked_at: string | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit_override?: number | null
          revoked_at?: string | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit_override?: number | null
          revoked_at?: string | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_pricing_plans_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rankings: {
        Row: {
          api_id: string
          category_id: string | null
          created_at: string | null
          date: string
          id: string
          overall_rank: number | null
          overall_score: number | null
          popularity_rank: number | null
          popularity_score: number | null
          quality_rank: number | null
          quality_score: number | null
          value_rank: number | null
          value_score: number | null
        }
        Insert: {
          api_id: string
          category_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          overall_rank?: number | null
          overall_score?: number | null
          popularity_rank?: number | null
          popularity_score?: number | null
          quality_rank?: number | null
          quality_score?: number | null
          value_rank?: number | null
          value_score?: number | null
        }
        Update: {
          api_id?: string
          category_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          overall_rank?: number | null
          overall_score?: number | null
          popularity_rank?: number | null
          popularity_score?: number | null
          quality_rank?: number | null
          quality_score?: number | null
          value_rank?: number | null
          value_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rankings_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rankings_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rankings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "api_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      api_requests_log: {
        Row: {
          api_id: string
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          status_code: number
          subscription_id: string | null
          upstream_latency_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_id: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number
          method?: string
          organization_id?: string
          path?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code?: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_log_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "api_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_requests_log_2026_02: {
        Row: {
          api_id: string
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          status_code: number
          subscription_id: string | null
          upstream_latency_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_id: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number
          method?: string
          organization_id?: string
          path?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code?: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_requests_log_2026_03: {
        Row: {
          api_id: string
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          status_code: number
          subscription_id: string | null
          upstream_latency_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_id: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number
          method?: string
          organization_id?: string
          path?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code?: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_requests_log_2026_04: {
        Row: {
          api_id: string
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          status_code: number
          subscription_id: string | null
          upstream_latency_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_id: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number
          method?: string
          organization_id?: string
          path?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code?: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_requests_log_2026_05: {
        Row: {
          api_id: string
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          status_code: number
          subscription_id: string | null
          upstream_latency_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_id: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms: number
          method: string
          organization_id: string
          path: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_id?: string
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          latency_ms?: number
          method?: string
          organization_id?: string
          path?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          status_code?: number
          subscription_id?: string | null
          upstream_latency_ms?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_reviews: {
        Row: {
          api_id: string
          body: string | null
          created_at: string | null
          hidden_at: string | null
          hidden_by: string | null
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
          hidden_at?: string | null
          hidden_by?: string | null
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
          hidden_at?: string | null
          hidden_by?: string | null
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
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
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
      billing_accounts: {
        Row: {
          billing_address: Json | null
          billing_email: string | null
          connect_status: string | null
          created_at: string | null
          default_payment_method_id: string | null
          id: string
          organization_id: string
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          billing_email?: string | null
          connect_status?: string | null
          created_at?: string | null
          default_payment_method_id?: string | null
          id?: string
          organization_id: string
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          billing_email?: string | null
          connect_status?: string | null
          created_at?: string | null
          default_payment_method_id?: string | null
          id?: string
          organization_id?: string
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_analytics: {
        Row: {
          api_id: string
          avg_cached_response_ms: number | null
          avg_uncached_response_ms: number | null
          bytes_saved: number | null
          cache_hits: number | null
          cache_misses: number | null
          cost_saved: number | null
          created_at: string | null
          date: string
          endpoint_id: string | null
          hit_rate: number | null
          id: string
          total_requests: number | null
        }
        Insert: {
          api_id: string
          avg_cached_response_ms?: number | null
          avg_uncached_response_ms?: number | null
          bytes_saved?: number | null
          cache_hits?: number | null
          cache_misses?: number | null
          cost_saved?: number | null
          created_at?: string | null
          date: string
          endpoint_id?: string | null
          hit_rate?: number | null
          id?: string
          total_requests?: number | null
        }
        Update: {
          api_id?: string
          avg_cached_response_ms?: number | null
          avg_uncached_response_ms?: number | null
          bytes_saved?: number | null
          cache_hits?: number | null
          cache_misses?: number | null
          cost_saved?: number | null
          created_at?: string | null
          date?: string
          endpoint_id?: string | null
          hit_rate?: number | null
          id?: string
          total_requests?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cache_analytics_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_analytics_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_analytics_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_invalidation_events: {
        Row: {
          api_id: string
          cache_rule_id: string | null
          created_at: string | null
          id: string
          invalidated_keys_count: number | null
          trigger: string | null
          triggered_by: string | null
        }
        Insert: {
          api_id: string
          cache_rule_id?: string | null
          created_at?: string | null
          id?: string
          invalidated_keys_count?: number | null
          trigger?: string | null
          triggered_by?: string | null
        }
        Update: {
          api_id?: string
          cache_rule_id?: string | null
          created_at?: string | null
          id?: string
          invalidated_keys_count?: number | null
          trigger?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cache_invalidation_events_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_invalidation_events_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_invalidation_events_cache_rule_id_fkey"
            columns: ["cache_rule_id"]
            isOneToOne: false
            referencedRelation: "cache_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_invalidation_events_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_rules: {
        Row: {
          api_id: string
          auto_detected: boolean | null
          cache_key_components: Json | null
          created_at: string | null
          endpoint_id: string | null
          id: string
          invalidation_events: Json | null
          is_enabled: boolean | null
          max_size_bytes: number | null
          ttl_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          api_id: string
          auto_detected?: boolean | null
          cache_key_components?: Json | null
          created_at?: string | null
          endpoint_id?: string | null
          id?: string
          invalidation_events?: Json | null
          is_enabled?: boolean | null
          max_size_bytes?: number | null
          ttl_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string
          auto_detected?: boolean | null
          cache_key_components?: Json | null
          created_at?: string | null
          endpoint_id?: string | null
          id?: string
          invalidation_events?: Json | null
          is_enabled?: boolean | null
          max_size_bytes?: number | null
          ttl_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cache_rules_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_rules_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_rules_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          organization_id: string | null
          proof_description: string | null
          proof_url: string | null
          score: number | null
          status: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          proof_description?: string | null
          proof_url?: string | null
          score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          proof_description?: string | null
          proof_url?: string | null
          score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "developer_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collab_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collab_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collab_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collab_recordings: {
        Row: {
          created_at: string | null
          duration_seconds: number
          event_count: number
          id: string
          is_public: boolean | null
          organization_id: string
          session_id: string
          share_slug: string | null
          summary: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds: number
          event_count: number
          id?: string
          is_public?: boolean | null
          organization_id: string
          session_id: string
          share_slug?: string | null
          summary?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number
          event_count?: number
          id?: string
          is_public?: boolean | null
          organization_id?: string
          session_id?: string
          share_slug?: string | null
          summary?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collab_recordings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collab_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      collab_sessions: {
        Row: {
          api_id: string | null
          code: string
          created_at: string | null
          creator_id: string
          ended_at: string | null
          id: string
          name: string
          organization_id: string
          participants: Json | null
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_id?: string | null
          code: string
          created_at?: string | null
          creator_id: string
          ended_at?: string | null
          id?: string
          name: string
          organization_id: string
          participants?: Json | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string | null
          code?: string
          created_at?: string | null
          creator_id?: string
          ended_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          participants?: Json | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collab_sessions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_sessions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_sessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collab_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          consented: boolean
          created_at: string | null
          document_version: string | null
          id: string
          ip_address: unknown
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consented: boolean
          created_at?: string | null
          document_version?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consented?: boolean
          created_at?: string | null
          document_version?: string | null
          id?: string
          ip_address?: unknown
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          reporter_id: string
          resource_id: string
          resource_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reporter_id: string
          resource_id: string
          resource_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          reporter_id?: string
          resource_id?: string
          resource_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      contract_test_results: {
        Row: {
          actual_latency_ms: number | null
          actual_response_sample: Json | null
          actual_status_code: number | null
          contract_id: string
          created_at: string | null
          endpoint_id: string | null
          failure_reason: string | null
          id: string
          status: string | null
          test_run_id: string
        }
        Insert: {
          actual_latency_ms?: number | null
          actual_response_sample?: Json | null
          actual_status_code?: number | null
          contract_id: string
          created_at?: string | null
          endpoint_id?: string | null
          failure_reason?: string | null
          id?: string
          status?: string | null
          test_run_id: string
        }
        Update: {
          actual_latency_ms?: number | null
          actual_response_sample?: Json | null
          actual_status_code?: number | null
          contract_id?: string
          created_at?: string | null
          endpoint_id?: string | null
          failure_reason?: string | null
          id?: string
          status?: string | null
          test_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_test_results_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "api_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_test_results_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_test_results_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "contract_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_test_runs: {
        Row: {
          api_id: string
          completed_at: string | null
          failed_tests: number | null
          id: string
          passed_tests: number | null
          started_at: string | null
          status: string | null
          total_tests: number | null
          triggered_by: string | null
        }
        Insert: {
          api_id: string
          completed_at?: string | null
          failed_tests?: number | null
          id?: string
          passed_tests?: number | null
          started_at?: string | null
          status?: string | null
          total_tests?: number | null
          triggered_by?: string | null
        }
        Update: {
          api_id?: string
          completed_at?: string | null
          failed_tests?: number | null
          id?: string
          passed_tests?: number | null
          started_at?: string | null
          status?: string | null
          total_tests?: number | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_test_runs_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_test_runs_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
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
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          grace_period_ends_at: string | null
          id: string
          organization_id: string | null
          reason: string | null
          requested_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          organization_id?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          organization_id?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          export_url: string | null
          file_size_bytes: number | null
          id: string
          organization_id: string | null
          requested_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          export_url?: string | null
          file_size_bytes?: number | null
          id?: string
          organization_id?: string | null
          requested_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          export_url?: string | null
          file_size_bytes?: number | null
          id?: string
          organization_id?: string | null
          requested_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_challenges: {
        Row: {
          api_id: string | null
          created_at: string | null
          criteria_json: Json | null
          description: string | null
          ends_at: string | null
          id: string
          starts_at: string
          title: string
        }
        Insert: {
          api_id?: string | null
          created_at?: string | null
          criteria_json?: Json | null
          description?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string
          title: string
        }
        Update: {
          api_id?: string | null
          created_at?: string | null
          criteria_json?: Json | null
          description?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_challenges_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "developer_challenges_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
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
      forum_posts: {
        Row: {
          body: string
          created_at: string | null
          hidden_at: string | null
          hidden_by: string | null
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
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
      invoice_line_items: {
        Row: {
          amount: number
          api_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          metadata: Json | null
          quantity: number
          subscription_id: string | null
          unit_price: number
        }
        Insert: {
          amount: number
          api_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          metadata?: Json | null
          quantity?: number
          subscription_id?: string | null
          unit_price: number
        }
        Update: {
          amount?: number
          api_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          metadata?: Json | null
          quantity?: number
          subscription_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "api_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          metadata: Json | null
          organization_id: string
          paid_at: string | null
          platform_fee: number
          status: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          metadata?: Json | null
          organization_id: string
          paid_at?: string | null
          platform_fee?: number
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          paid_at?: string | null
          platform_fee?: number
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      legal_acceptances: {
        Row: {
          accepted_at: string | null
          document_id: string
          document_type: string
          document_version: string
          id: string
          ip_address: unknown
          organization_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          document_id: string
          document_type: string
          document_version: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          document_id?: string
          document_type?: string
          document_version?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_acceptances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          document_type: string
          id: string
          is_current: boolean | null
          published_at: string | null
          title: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_type: string
          id?: string
          is_current?: boolean | null
          published_at?: string | null
          title: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string
          id?: string
          is_current?: boolean | null
          published_at?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      market_trends: {
        Row: {
          avg_price_per_call: number | null
          category_id: string | null
          created_at: string | null
          date: string
          growth_rate_30d: number | null
          growth_rate_7d: number | null
          id: string
          total_apis: number | null
          total_calls: number | null
          total_subscribers: number | null
        }
        Insert: {
          avg_price_per_call?: number | null
          category_id?: string | null
          created_at?: string | null
          date: string
          growth_rate_30d?: number | null
          growth_rate_7d?: number | null
          id?: string
          total_apis?: number | null
          total_calls?: number | null
          total_subscribers?: number | null
        }
        Update: {
          avg_price_per_call?: number | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          growth_rate_30d?: number | null
          growth_rate_7d?: number | null
          id?: string
          total_apis?: number | null
          total_calls?: number | null
          total_subscribers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_trends_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "api_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_metrics_daily: {
        Row: {
          churned_subscriptions: number | null
          created_at: string | null
          date: string
          id: string
          new_subscriptions: number | null
          total_active_apis: number | null
          total_active_providers: number | null
          total_active_subscriptions: number | null
          total_api_calls: number | null
          total_revenue_platform: number | null
        }
        Insert: {
          churned_subscriptions?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_subscriptions?: number | null
          total_active_apis?: number | null
          total_active_providers?: number | null
          total_active_subscriptions?: number | null
          total_api_calls?: number | null
          total_revenue_platform?: number | null
        }
        Update: {
          churned_subscriptions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_subscriptions?: number | null
          total_active_apis?: number | null
          total_active_providers?: number | null
          total_active_subscriptions?: number | null
          total_api_calls?: number | null
          total_revenue_platform?: number | null
        }
        Relationships: []
      }
      migration_configs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_threshold_pct: number | null
          id: string
          organization_id: string
          source_api_id: string
          started_at: string | null
          status: string | null
          strategy: string | null
          subscription_id: string | null
          target_api_id: string
          traffic_split_schedule: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_threshold_pct?: number | null
          id?: string
          organization_id: string
          source_api_id: string
          started_at?: string | null
          status?: string | null
          strategy?: string | null
          subscription_id?: string | null
          target_api_id: string
          traffic_split_schedule?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_threshold_pct?: number | null
          id?: string
          organization_id?: string
          source_api_id?: string
          started_at?: string | null
          status?: string | null
          strategy?: string | null
          subscription_id?: string | null
          target_api_id?: string
          traffic_split_schedule?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_source_api_id_fkey"
            columns: ["source_api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_source_api_id_fkey"
            columns: ["source_api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "api_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_target_api_id_fkey"
            columns: ["target_api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_target_api_id_fkey"
            columns: ["target_api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_results: {
        Row: {
          completed_at: string | null
          cost_difference: number | null
          id: string
          migration_id: string
          recommendation: string | null
          source_avg_latency_ms: number | null
          source_error_rate: number | null
          source_monthly_cost: number | null
          target_avg_latency_ms: number | null
          target_error_rate: number | null
          target_monthly_cost: number | null
        }
        Insert: {
          completed_at?: string | null
          cost_difference?: number | null
          id?: string
          migration_id: string
          recommendation?: string | null
          source_avg_latency_ms?: number | null
          source_error_rate?: number | null
          source_monthly_cost?: number | null
          target_avg_latency_ms?: number | null
          target_error_rate?: number | null
          target_monthly_cost?: number | null
        }
        Update: {
          completed_at?: string | null
          cost_difference?: number | null
          id?: string
          migration_id?: string
          recommendation?: string | null
          source_avg_latency_ms?: number | null
          source_error_rate?: number | null
          source_monthly_cost?: number | null
          target_avg_latency_ms?: number | null
          target_error_rate?: number | null
          target_monthly_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_results_migration_id_fkey"
            columns: ["migration_id"]
            isOneToOne: false
            referencedRelation: "migration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_traffic_splits: {
        Row: {
          actual_source_calls: number | null
          actual_target_calls: number | null
          created_at: string | null
          effective_at: string
          id: string
          migration_id: string
          source_error_rate: number | null
          source_percentage: number | null
          target_error_rate: number | null
          target_percentage: number | null
        }
        Insert: {
          actual_source_calls?: number | null
          actual_target_calls?: number | null
          created_at?: string | null
          effective_at: string
          id?: string
          migration_id: string
          source_error_rate?: number | null
          source_percentage?: number | null
          target_error_rate?: number | null
          target_percentage?: number | null
        }
        Update: {
          actual_source_calls?: number | null
          actual_target_calls?: number | null
          created_at?: string | null
          effective_at?: string
          id?: string
          migration_id?: string
          source_error_rate?: number | null
          source_percentage?: number | null
          target_error_rate?: number | null
          target_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "migration_traffic_splits_migration_id_fkey"
            columns: ["migration_id"]
            isOneToOne: false
            referencedRelation: "migration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          event_type: string
          id: string
          in_app_enabled: boolean | null
          organization_id: string
          updated_at: string | null
          user_id: string
          webhook_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          event_type: string
          id?: string
          in_app_enabled?: boolean | null
          organization_id: string
          updated_at?: string | null
          user_id: string
          webhook_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          event_type?: string
          id?: string
          in_app_enabled?: boolean | null
          organization_id?: string
          updated_at?: string | null
          user_id?: string
          webhook_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          event_type: string
          id: string
          is_read: boolean | null
          link: string | null
          metadata: Json | null
          organization_id: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          event_type: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          event_type?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      performance_metrics: {
        Row: {
          date: string
          id: string
          metric_type: string
          p50_ms: number | null
          p95_ms: number | null
          p99_ms: number | null
          route: string | null
          sample_count: number | null
          timestamp: string | null
        }
        Insert: {
          date: string
          id?: string
          metric_type: string
          p50_ms?: number | null
          p95_ms?: number | null
          p99_ms?: number | null
          route?: string | null
          sample_count?: number | null
          timestamp?: string | null
        }
        Update: {
          date?: string
          id?: string
          metric_type?: string
          p50_ms?: number | null
          p95_ms?: number | null
          p99_ms?: number | null
          route?: string | null
          sample_count?: number | null
          timestamp?: string | null
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
      rate_limit_violations: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          limit_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          limit_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          limit_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_claimed_at: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_claimed_at?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_claimed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          organization_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_definitions: {
        Row: {
          api_id: string
          created_at: string | null
          error_rate_target: number | null
          id: string
          is_active: boolean | null
          latency_p50_target_ms: number | null
          latency_p95_target_ms: number | null
          measurement_window: string | null
          updated_at: string | null
          uptime_target: number | null
        }
        Insert: {
          api_id: string
          created_at?: string | null
          error_rate_target?: number | null
          id?: string
          is_active?: boolean | null
          latency_p50_target_ms?: number | null
          latency_p95_target_ms?: number | null
          measurement_window?: string | null
          updated_at?: string | null
          uptime_target?: number | null
        }
        Update: {
          api_id?: string
          created_at?: string | null
          error_rate_target?: number | null
          id?: string
          is_active?: boolean | null
          latency_p50_target_ms?: number | null
          latency_p95_target_ms?: number | null
          measurement_window?: string | null
          updated_at?: string | null
          uptime_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_definitions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_definitions_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_measurements: {
        Row: {
          api_id: string
          created_at: string | null
          error_rate: number | null
          failed_requests: number | null
          id: string
          is_within_sla: boolean | null
          latency_p50_ms: number | null
          latency_p95_ms: number | null
          sla_id: string | null
          total_requests: number | null
          uptime_percentage: number | null
          window_end: string
          window_start: string
        }
        Insert: {
          api_id: string
          created_at?: string | null
          error_rate?: number | null
          failed_requests?: number | null
          id?: string
          is_within_sla?: boolean | null
          latency_p50_ms?: number | null
          latency_p95_ms?: number | null
          sla_id?: string | null
          total_requests?: number | null
          uptime_percentage?: number | null
          window_end: string
          window_start: string
        }
        Update: {
          api_id?: string
          created_at?: string | null
          error_rate?: number | null
          failed_requests?: number | null
          id?: string
          is_within_sla?: boolean | null
          latency_p50_ms?: number | null
          latency_p95_ms?: number | null
          sla_id?: string | null
          total_requests?: number | null
          uptime_percentage?: number | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_measurements_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_measurements_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_measurements_sla_id_fkey"
            columns: ["sla_id"]
            isOneToOne: false
            referencedRelation: "sla_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_violations: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          actual_value: number | null
          api_id: string
          created_at: string | null
          id: string
          measurement_id: string | null
          severity: string | null
          sla_id: string
          target_value: number | null
          violation_type: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          api_id: string
          created_at?: string | null
          id?: string
          measurement_id?: string | null
          severity?: string | null
          sla_id: string
          target_value?: number | null
          violation_type?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          api_id?: string
          created_at?: string | null
          id?: string
          measurement_id?: string | null
          severity?: string | null
          sla_id?: string
          target_value?: number | null
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_violations_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "sla_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_violations_sla_id_fkey"
            columns: ["sla_id"]
            isOneToOne: false
            referencedRelation: "sla_definitions"
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
          is_completed: boolean | null
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
          is_completed?: boolean | null
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
          is_completed?: boolean | null
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
      support_tickets: {
        Row: {
          assigned_at: string | null
          assigned_to_user_id: string | null
          category: string
          closed_at: string | null
          created_at: string | null
          custom_fields: Json | null
          first_response_at: string | null
          id: string
          inquiry_type: string
          message: string | null
          priority: string | null
          report_type: string | null
          resolved_at: string | null
          sla_breach: boolean | null
          source_page: string | null
          source_url: string | null
          status: string
          subject: string
          submitter_company: string | null
          submitter_email: string
          submitter_name: string | null
          submitter_user_id: string | null
          tags: string[] | null
          ticket_number: string
          updated_at: string | null
          urgency: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to_user_id?: string | null
          category: string
          closed_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          first_response_at?: string | null
          id?: string
          inquiry_type: string
          message?: string | null
          priority?: string | null
          report_type?: string | null
          resolved_at?: string | null
          sla_breach?: boolean | null
          source_page?: string | null
          source_url?: string | null
          status?: string
          subject: string
          submitter_company?: string | null
          submitter_email: string
          submitter_name?: string | null
          submitter_user_id?: string | null
          tags?: string[] | null
          ticket_number: string
          updated_at?: string | null
          urgency: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to_user_id?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          first_response_at?: string | null
          id?: string
          inquiry_type?: string
          message?: string | null
          priority?: string | null
          report_type?: string | null
          resolved_at?: string | null
          sla_breach?: boolean | null
          source_page?: string | null
          source_url?: string | null
          status?: string
          subject?: string
          submitter_company?: string | null
          submitter_email?: string
          submitter_name?: string | null
          submitter_user_id?: string | null
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string | null
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_submitter_user_id_fkey"
            columns: ["submitter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activity_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          author_email: string | null
          author_name: string | null
          author_user_id: string | null
          created_at: string | null
          id: string
          is_staff: boolean | null
          is_system: boolean | null
          message: string
          message_type: string | null
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          author_email?: string | null
          author_name?: string | null
          author_user_id?: string | null
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          is_system?: boolean | null
          message: string
          message_type?: string | null
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          author_email?: string | null
          author_name?: string | null
          author_user_id?: string | null
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          is_system?: boolean | null
          message?: string
          message_type?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records_daily: {
        Row: {
          api_id: string
          avg_latency_ms: number | null
          created_at: string | null
          day: string
          error_4xx_count: number | null
          error_5xx_count: number | null
          failed_calls: number | null
          id: string
          organization_id: string
          subscription_id: string
          successful_calls: number | null
          total_calls: number | null
          total_request_bytes: number | null
          total_response_bytes: number | null
        }
        Insert: {
          api_id: string
          avg_latency_ms?: number | null
          created_at?: string | null
          day: string
          error_4xx_count?: number | null
          error_5xx_count?: number | null
          failed_calls?: number | null
          id?: string
          organization_id: string
          subscription_id: string
          successful_calls?: number | null
          total_calls?: number | null
          total_request_bytes?: number | null
          total_response_bytes?: number | null
        }
        Update: {
          api_id?: string
          avg_latency_ms?: number | null
          created_at?: string | null
          day?: string
          error_4xx_count?: number | null
          error_5xx_count?: number | null
          failed_calls?: number | null
          id?: string
          organization_id?: string
          subscription_id?: string
          successful_calls?: number | null
          total_calls?: number | null
          total_request_bytes?: number | null
          total_response_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_daily_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_daily_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_daily_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_daily_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "api_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records_hourly: {
        Row: {
          api_id: string
          created_at: string | null
          error_4xx_count: number | null
          error_5xx_count: number | null
          failed_calls: number | null
          hour: string
          id: string
          max_latency_ms: number | null
          min_latency_ms: number | null
          organization_id: string
          subscription_id: string
          successful_calls: number | null
          total_calls: number | null
          total_latency_ms: number | null
        }
        Insert: {
          api_id: string
          created_at?: string | null
          error_4xx_count?: number | null
          error_5xx_count?: number | null
          failed_calls?: number | null
          hour: string
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          organization_id: string
          subscription_id: string
          successful_calls?: number | null
          total_calls?: number | null
          total_latency_ms?: number | null
        }
        Update: {
          api_id?: string
          created_at?: string | null
          error_4xx_count?: number | null
          error_5xx_count?: number | null
          failed_calls?: number | null
          hour?: string
          id?: string
          max_latency_ms?: number | null
          min_latency_ms?: number | null
          organization_id?: string
          subscription_id?: string
          successful_calls?: number | null
          total_calls?: number | null
          total_latency_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_hourly_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "api_rankings_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_hourly_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_hourly_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_hourly_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "api_subscriptions"
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
          is_platform_admin: boolean | null
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
          is_platform_admin?: boolean | null
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
          is_platform_admin?: boolean | null
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
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string | null
          webhook_endpoint_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_endpoint_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_endpoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          organization_id: string
          secret: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          organization_id: string
          secret: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          organization_id?: string
          secret?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          created_at: string | null
          description: string | null
          edges: Json
          execution_count: number | null
          id: string
          last_executed_at: string | null
          name: string
          nodes: Json
          organization_id: string
          schedule_cron: string | null
          settings: Json | null
          status: string | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name: string
          nodes?: Json
          organization_id: string
          schedule_cron?: string | null
          settings?: Json | null
          status?: string | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edges?: Json
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          name?: string
          nodes?: Json
          organization_id?: string
          schedule_cron?: string | null
          settings?: Json | null
          status?: string | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_definitions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          started_at: string | null
          status: string | null
          trigger_data: Json | null
          trigger_type: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          trigger_type: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          trigger_type?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_marketplace: {
        Row: {
          author_organization_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          install_count: number | null
          is_featured: boolean | null
          name: string
          preview_image_url: string | null
          rating: number | null
          required_apis: string[] | null
          tags: string[] | null
          updated_at: string | null
          workflow_definition_id: string
        }
        Insert: {
          author_organization_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          install_count?: number | null
          is_featured?: boolean | null
          name: string
          preview_image_url?: string | null
          rating?: number | null
          required_apis?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          workflow_definition_id: string
        }
        Update: {
          author_organization_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          install_count?: number | null
          is_featured?: boolean | null
          name?: string
          preview_image_url?: string | null
          rating?: number | null
          required_apis?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          workflow_definition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_marketplace_author_organization_id_fkey"
            columns: ["author_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_marketplace_workflow_definition_id_fkey"
            columns: ["workflow_definition_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_results: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error: Json | null
          execution_id: string
          id: string
          input_data: Json | null
          node_id: string
          output_data: Json | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error?: Json | null
          execution_id: string
          id?: string
          input_data?: Json | null
          node_id: string
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error?: Json | null
          execution_id?: string
          id?: string
          input_data?: Json | null
          node_id?: string
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_results_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      api_rankings_mv: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          id: string | null
          last_updated: string | null
          name: string | null
          org_name: string | null
          org_slug: string | null
          organization_id: string | null
          review_count: number | null
          slug: string | null
          subscriber_count: number | null
          total_requests: number | null
        }
        Relationships: [
          {
            foreignKeyName: "apis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_kpis: {
        Row: {
          active_apis: number | null
          active_subscriptions: number | null
          last_updated: string | null
          revenue_30d: number | null
          total_organizations: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_hourly_usage: { Args: never; Returns: undefined }
      generate_ticket_number: { Args: never; Returns: string }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      refresh_api_rankings: { Args: never; Returns: undefined }
      refresh_platform_kpis: { Args: never; Returns: undefined }
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
