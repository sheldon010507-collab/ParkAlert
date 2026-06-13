export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parking_locations: {
        Row: {
          id: string
          user_id: string
          latitude: number
          longitude: number
          address: string | null
          alert_radius: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          latitude: number
          longitude: number
          address?: string | null
          alert_radius?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          latitude?: number
          longitude?: number
          address?: string | null
          alert_radius?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parking_sessions: {
        Row: {
          id: string
          user_id: string
          parking_location_id: string
          started_at: string
          ended_at: string | null
          alert_count: number
        }
        Insert: {
          id?: string
          user_id: string
          parking_location_id: string
          started_at?: string
          ended_at?: string | null
          alert_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          parking_location_id?: string
          started_at?: string
          ended_at?: string | null
          alert_count?: number
        }
      }
      alert_logs: {
        Row: {
          id: string
          user_id: string
          parking_location_id: string
          distance: number
          alert_type: 'distance' | 'time'
          acknowledged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parking_location_id: string
          distance: number
          alert_type: 'distance' | 'time'
          acknowledged?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          parking_location_id?: string
          distance?: number
          alert_type?: 'distance' | 'time'
          acknowledged?: boolean
          created_at?: string
        }
      }
    }
  }
}
