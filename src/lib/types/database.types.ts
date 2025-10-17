export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      animals: {
        Row: {
          id: string
          animal_id: string
          category: Database['public']['Enums']['animal_category']
          incoming_company: string | null
          entry_date: string
          old_calf_number: string | null
          entry_weight: number | null
          age_months: number | null
          purchase_price: number | null
          current_stage_id: string | null
          current_room_id: string | null
          is_alive: boolean
          is_sold: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          animal_id: string
          category: Database['public']['Enums']['animal_category']
          incoming_company?: string | null
          entry_date: string
          old_calf_number?: string | null
          entry_weight?: number | null
          age_months?: number | null
          purchase_price?: number | null
          current_stage_id?: string | null
          current_room_id?: string | null
          is_alive?: boolean
          is_sold?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          animal_id?: string
          category?: Database['public']['Enums']['animal_category']
          incoming_company?: string | null
          entry_date?: string
          old_calf_number?: string | null
          entry_weight?: number | null
          age_months?: number | null
          purchase_price?: number | null
          current_stage_id?: string | null
          current_room_id?: string | null
          is_alive?: boolean
          is_sold?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_current_room_id_fkey"
            columns: ["current_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      animal_movements: {
        Row: {
          id: string
          animal_id: string
          from_stage_id: string | null
          from_room_id: string | null
          to_stage_id: string | null
          to_room_id: string | null
          movement_date: string
          moved_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          from_stage_id?: string | null
          from_room_id?: string | null
          to_stage_id?: string | null
          to_room_id?: string | null
          movement_date?: string
          moved_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          from_stage_id?: string | null
          from_room_id?: string | null
          to_stage_id?: string | null
          to_room_id?: string | null
          movement_date?: string
          moved_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_movements_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_from_room_id_fkey"
            columns: ["from_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_to_room_id_fkey"
            columns: ["to_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      death_reports: {
        Row: {
          id: string
          animal_id: string
          death_date: string
          last_weight: number | null
          cause_of_death: string | null
          notes: string | null
          created_at: string
          reported_by: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          death_date: string
          last_weight?: number | null
          cause_of_death?: string | null
          notes?: string | null
          created_at?: string
          reported_by?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          death_date?: string
          last_weight?: number | null
          cause_of_death?: string | null
          notes?: string | null
          created_at?: string
          reported_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "death_reports_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      feeding_logs: {
        Row: {
          id: string
          room_id: string
          stage_id: string | null
          feed_type: Database['public']['Enums']['feed_type']
          company_name: string | null
          item_name: string | null
          mcr_quantity: number | null
          mcr_price: number | null
          protein_percentage: number | null
          concentrate_quantity: number | null
          concentrate_price: number | null
          bale_weight: number | null
          bale_quantity: number | null
          bale_price: number | null
          premix_volume: string | null
          premix_quantity: number | null
          premix_price: number | null
          daily_use: number | null
          date_of_use: string
          purchase_date: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          room_id: string
          stage_id?: string | null
          feed_type: Database['public']['Enums']['feed_type']
          company_name?: string | null
          item_name?: string | null
          mcr_quantity?: number | null
          mcr_price?: number | null
          protein_percentage?: number | null
          concentrate_quantity?: number | null
          concentrate_price?: number | null
          bale_weight?: number | null
          bale_quantity?: number | null
          bale_price?: number | null
          premix_volume?: string | null
          premix_quantity?: number | null
          premix_price?: number | null
          daily_use?: number | null
          date_of_use: string
          purchase_date?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          stage_id?: string | null
          feed_type?: Database['public']['Enums']['feed_type']
          company_name?: string | null
          item_name?: string | null
          mcr_quantity?: number | null
          mcr_price?: number | null
          protein_percentage?: number | null
          concentrate_quantity?: number | null
          concentrate_price?: number | null
          bale_weight?: number | null
          bale_quantity?: number | null
          bale_price?: number | null
          premix_volume?: string | null
          premix_quantity?: number | null
          premix_price?: number | null
          daily_use?: number | null
          date_of_use?: string
          purchase_date?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feeding_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_logs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_logs_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory: {
        Row: {
          id: string
          product_name: string
          quantity: number
          unit: string | null
          purchase_date: string | null
          price: number | null
          total_cost: number | null
          category: string | null
          alert_threshold: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_name: string
          quantity: number
          unit?: string | null
          purchase_date?: string | null
          price?: number | null
          total_cost?: number | null
          category?: string | null
          alert_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          quantity?: number
          unit?: string | null
          purchase_date?: string | null
          price?: number | null
          total_cost?: number | null
          category?: string | null
          alert_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      medicine_logs: {
        Row: {
          id: string
          animal_id: string
          room_id: string | null
          stage_id: string | null
          drug_company: string | null
          drug_name: string
          drug_type: Database['public']['Enums']['medicine_unit']
          drug_volume: number | null
          drug_price: number | null
          drug_dose: number | null
          treatment_days: number | null
          treatment_start_date: string | null
          treatment_end_date: string | null
          illness: string | null
          quantity_remaining: number | null
          purchase_date: string | null
          created_at: string
          administered_by: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          room_id?: string | null
          stage_id?: string | null
          drug_company?: string | null
          drug_name: string
          drug_type: Database['public']['Enums']['medicine_unit']
          drug_volume?: number | null
          drug_price?: number | null
          drug_dose?: number | null
          treatment_days?: number | null
          treatment_start_date?: string | null
          treatment_end_date?: string | null
          illness?: string | null
          quantity_remaining?: number | null
          purchase_date?: string | null
          created_at?: string
          administered_by?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          room_id?: string | null
          stage_id?: string | null
          drug_company?: string | null
          drug_name?: string
          drug_type?: Database['public']['Enums']['medicine_unit']
          drug_volume?: number | null
          drug_price?: number | null
          drug_dose?: number | null
          treatment_days?: number | null
          treatment_start_date?: string | null
          treatment_end_date?: string | null
          illness?: string | null
          quantity_remaining?: number | null
          purchase_date?: string | null
          created_at?: string
          administered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_logs_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_logs_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_logs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_logs_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          stage_id: string
          identifier: Database['public']['Enums']['room_identifier']
          capacity: number
          current_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          stage_id: string
          identifier: Database['public']['Enums']['room_identifier']
          capacity?: number
          current_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          stage_id?: string
          identifier?: Database['public']['Enums']['room_identifier']
          capacity?: number
          current_count?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      slaughter_reports: {
        Row: {
          id: string
          animal_id: string
          slaughter_date: string
          slaughter_weight: number
          carcass_weight: number
          carcass_percentage: number | null
          selling_price: number | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          slaughter_date: string
          slaughter_weight: number
          carcass_weight: number
          carcass_percentage?: number | null
          selling_price?: number | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          slaughter_date?: string
          slaughter_weight?: number
          carcass_weight?: number
          carcass_percentage?: number | null
          selling_price?: number | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slaughter_reports_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slaughter_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      stages: {
        Row: {
          id: string
          name: Database['public']['Enums']['stage_type']
          display_name: string
          description: string | null
          min_weight_times: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: Database['public']['Enums']['stage_type']
          display_name: string
          description?: string | null
          min_weight_times?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: Database['public']['Enums']['stage_type']
          display_name?: string
          description?: string | null
          min_weight_times?: number | null
          created_at?: string
        }
        Relationships: []
      }
      vaccine_logs: {
        Row: {
          id: string
          animal_id: string
          room_id: string | null
          stage_id: string | null
          vaccine_name: string
          vaccine_volume: number | null
          vaccine_dose: number | null
          vaccine_price: number | null
          first_dose_date: string | null
          second_dose_date: string | null
          second_dose_days_gap: number | null
          batch_from_animal_id: string | null
          batch_to_animal_id: string | null
          purchase_date: string | null
          created_at: string
          administered_by: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          room_id?: string | null
          stage_id?: string | null
          vaccine_name: string
          vaccine_volume?: number | null
          vaccine_dose?: number | null
          vaccine_price?: number | null
          first_dose_date?: string | null
          second_dose_date?: string | null
          second_dose_days_gap?: number | null
          batch_from_animal_id?: string | null
          batch_to_animal_id?: string | null
          purchase_date?: string | null
          created_at?: string
          administered_by?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          room_id?: string | null
          stage_id?: string | null
          vaccine_name?: string
          vaccine_volume?: number | null
          vaccine_dose?: number | null
          vaccine_price?: number | null
          first_dose_date?: string | null
          second_dose_date?: string | null
          second_dose_days_gap?: number | null
          batch_from_animal_id?: string | null
          batch_to_animal_id?: string | null
          purchase_date?: string | null
          created_at?: string
          administered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccine_logs_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccine_logs_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccine_logs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccine_logs_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
      weight_records: {
        Row: {
          id: string
          animal_id: string
          stage_id: string | null
          room_id: string | null
          weight: number
          weight_sequence: number | null
          recorded_date: string
          recorded_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          animal_id: string
          stage_id?: string | null
          room_id?: string | null
          weight: number
          weight_sequence?: number | null
          recorded_date: string
          recorded_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          animal_id?: string
          stage_id?: string | null
          room_id?: string | null
          weight?: number
          weight_sequence?: number | null
          recorded_date?: string
          recorded_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_records_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weight_records_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      animal_category: "beef" | "camel" | "sheep" | "goat"
      feed_type: "mcr" | "concentrated_feed" | "alfa_alfa" | "hay" | "premix"
      medicine_unit: "ml" | "tablet" | "gram" | "injection"
      room_identifier: "A" | "B" | "C" | "D" | "E" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28"
      stage_type: "receiving" | "weaning" | "fattening" | "finishing"
      user_role: "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
