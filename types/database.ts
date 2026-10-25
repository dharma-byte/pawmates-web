
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "blocks": {
                  Row: {
                    "blocked_id": string,"blocker_id": string,"created_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocked_id": string,"blocker_id"?: string,"created_at"?: string
                  }
                  Update: {
                    "blocked_id"?: string,"blocker_id"?: string,"created_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocks_blocked_id_fkey"
      columns: ["blocked_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "blocks_blocker_id_fkey"
      columns: ["blocker_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"connections": {
                  Row: {
                    "addressee_id": string,"created_at": string,"id": string,"message": string | null,"pet_id": string | null,"requester_id": string,"responded_at": string | null,"status": Database["public"]['Enums']["connection_status"],"target_pet_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "addressee_id": string,"created_at"?: string,"id"?: string,"message"?: string | null,"pet_id"?: string | null,"requester_id"?: string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["connection_status"],"target_pet_id"?: string | null
                  }
                  Update: {
                    "addressee_id"?: string,"created_at"?: string,"id"?: string,"message"?: string | null,"pet_id"?: string | null,"requester_id"?: string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["connection_status"],"target_pet_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "connections_addressee_id_fkey"
      columns: ["addressee_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "connections_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "connections_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "connections_target_pet_id_fkey"
      columns: ["target_pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"conversation_members": {
                  Row: {
                    "conversation_id": string,"joined_at": string,"last_read_at": string,"muted": boolean,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id": string,"joined_at"?: string,"last_read_at"?: string,"muted"?: boolean,"role"?: string,"user_id": string
                  }
                  Update: {
                    "conversation_id"?: string,"joined_at"?: string,"last_read_at"?: string,"muted"?: boolean,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversation_members_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversation_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"conversations": {
                  Row: {
                    "created_at": string,"event_id": string | null,"group_id": string | null,"id": string,"last_message_at": string | null,"type": Database["public"]['Enums']["conversation_type"],"user_high": string | null,"user_low": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"event_id"?: string | null,"group_id"?: string | null,"id"?: string,"last_message_at"?: string | null,"type": Database["public"]['Enums']["conversation_type"],"user_high"?: string | null,"user_low"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"event_id"?: string | null,"group_id"?: string | null,"id"?: string,"last_message_at"?: string | null,"type"?: Database["public"]['Enums']["conversation_type"],"user_high"?: string | null,"user_low"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_user_high_fkey"
      columns: ["user_high"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_user_low_fkey"
      columns: ["user_low"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "attachment_url": string | null,"body": string | null,"conversation_id": string,"created_at": string,"deleted_at": string | null,"edited_at": string | null,"id": string,"location": unknown,"metadata": NonNullable<Json>,"sender_id": string,"type": Database["public"]['Enums']["message_type"]
                  }
                  ComputedFields: never
                  Insert: {
                    "attachment_url"?: string | null,"body"?: string | null,"conversation_id": string,"created_at"?: string,"deleted_at"?: string | null,"edited_at"?: string | null,"id"?: string,"location"?: unknown,"metadata"?: NonNullable<Json>,"sender_id"?: string,"type"?: Database["public"]['Enums']["message_type"]
                  }
                  Update: {
                    "attachment_url"?: string | null,"body"?: string | null,"conversation_id"?: string,"created_at"?: string,"deleted_at"?: string | null,"edited_at"?: string | null,"id"?: string,"location"?: unknown,"metadata"?: NonNullable<Json>,"sender_id"?: string,"type"?: Database["public"]['Enums']["message_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"pets": {
                  Row: {
                    "allergies": string | null,"birth_date": string | null,"breed": string | null,"created_at": string,"dislikes": (string)[],"energy": Database["public"]['Enums']["energy_level"] | null,"gender": Database["public"]['Enums']["pet_gender"],"good_with_cats": boolean | null,"good_with_kids": boolean | null,"good_with_small_dogs": boolean | null,"id": string,"likes": (string)[],"name": string,"neutered": boolean | null,"owner_id": string,"photos": (string)[],"play_style": Database["public"]['Enums']["play_style"] | null,"size": Database["public"]['Enums']["pet_size"] | null,"special_needs": string | null,"species": Database["public"]['Enums']["pet_species"],"temperament": Database["public"]['Enums']["pet_temperament"] | null,"updated_at": string,"vaccinated": boolean,"vaccinated_on": string | null,"weight_kg": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "allergies"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"created_at"?: string,"dislikes"?: (string)[],"energy"?: Database["public"]['Enums']["energy_level"] | null,"gender"?: Database["public"]['Enums']["pet_gender"],"good_with_cats"?: boolean | null,"good_with_kids"?: boolean | null,"good_with_small_dogs"?: boolean | null,"id"?: string,"likes"?: (string)[],"name": string,"neutered"?: boolean | null,"owner_id"?: string,"photos"?: (string)[],"play_style"?: Database["public"]['Enums']["play_style"] | null,"size"?: Database["public"]['Enums']["pet_size"] | null,"special_needs"?: string | null,"species": Database["public"]['Enums']["pet_species"],"temperament"?: Database["public"]['Enums']["pet_temperament"] | null,"updated_at"?: string,"vaccinated"?: boolean,"vaccinated_on"?: string | null,"weight_kg"?: number | null
                  }
                  Update: {
                    "allergies"?: string | null,"birth_date"?: string | null,"breed"?: string | null,"created_at"?: string,"dislikes"?: (string)[],"energy"?: Database["public"]['Enums']["energy_level"] | null,"gender"?: Database["public"]['Enums']["pet_gender"],"good_with_cats"?: boolean | null,"good_with_kids"?: boolean | null,"good_with_small_dogs"?: boolean | null,"id"?: string,"likes"?: (string)[],"name"?: string,"neutered"?: boolean | null,"owner_id"?: string,"photos"?: (string)[],"play_style"?: Database["public"]['Enums']["play_style"] | null,"size"?: Database["public"]['Enums']["pet_size"] | null,"special_needs"?: string | null,"species"?: Database["public"]['Enums']["pet_species"],"temperament"?: Database["public"]['Enums']["pet_temperament"] | null,"updated_at"?: string,"vaccinated"?: boolean,"vaccinated_on"?: string | null,"weight_kg"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pets_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "area_name": string | null,"avatar_url": string | null,"ban_reason": string | null,"banned_at": string | null,"bio": string | null,"created_at": string,"full_name": string | null,"id": string,"interests": (string)[],"is_admin": boolean,"languages": (string)[],"location": unknown,"message_privacy": Database["public"]['Enums']["message_privacy"],"onboarded_at": string | null,"public_location": unknown,"show_area": boolean,"show_online": boolean,"updated_at": string,"username": string | null,"verification_status": Database["public"]['Enums']["verification_status"],"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "area_name"?: string | null,"avatar_url"?: string | null,"ban_reason"?: string | null,"banned_at"?: string | null,"bio"?: string | null,"created_at"?: string,"full_name"?: string | null,"id": string,"interests"?: (string)[],"is_admin"?: boolean,"languages"?: (string)[],"location"?: unknown,"message_privacy"?: Database["public"]['Enums']["message_privacy"],"onboarded_at"?: string | null,"public_location"?: unknown,"show_area"?: boolean,"show_online"?: boolean,"updated_at"?: string,"username"?: string | null,"verification_status"?: Database["public"]['Enums']["verification_status"],"verified_at"?: string | null
                  }
                  Update: {
                    "area_name"?: string | null,"avatar_url"?: string | null,"ban_reason"?: string | null,"banned_at"?: string | null,"bio"?: string | null,"created_at"?: string,"full_name"?: string | null,"id"?: string,"interests"?: (string)[],"is_admin"?: boolean,"languages"?: (string)[],"location"?: unknown,"message_privacy"?: Database["public"]['Enums']["message_privacy"],"onboarded_at"?: string | null,"public_location"?: unknown,"show_area"?: boolean,"show_online"?: boolean,"updated_at"?: string,"username"?: string | null,"verification_status"?: Database["public"]['Enums']["verification_status"],"verified_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"reports": {
                  Row: {
                    "admin_notes": string | null,"created_at": string,"details": string | null,"id": string,"reason": Database["public"]['Enums']["report_reason"],"reporter_id": string,"resolved_at": string | null,"resolved_by": string | null,"status": Database["public"]['Enums']["report_status"],"target_id": string,"target_type": Database["public"]['Enums']["report_target"]
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string | null,"created_at"?: string,"details"?: string | null,"id"?: string,"reason": Database["public"]['Enums']["report_reason"],"reporter_id"?: string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"],"target_id": string,"target_type": Database["public"]['Enums']["report_target"]
                  }
                  Update: {
                    "admin_notes"?: string | null,"created_at"?: string,"details"?: string | null,"id"?: string,"reason"?: Database["public"]['Enums']["report_reason"],"reporter_id"?: string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"],"target_id"?: string,"target_type"?: Database["public"]['Enums']["report_target"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"verifications": {
                  Row: {
                    "created_at": string,"id": string,"method": Database["public"]['Enums']["verification_method"],"notes": string | null,"pet_photo_path": string,"profile_photo_path": string,"reviewed_at": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["verification_request_status"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"method"?: Database["public"]['Enums']["verification_method"],"notes"?: string | null,"pet_photo_path": string,"profile_photo_path": string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["verification_request_status"],"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"method"?: Database["public"]['Enums']["verification_method"],"notes"?: string | null,"pet_photo_path"?: string,"profile_photo_path"?: string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["verification_request_status"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "verifications_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "verifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_stats":
{ Args: Record<PropertyKey, never>; Returns: {
              "messages_last_7_days": number,"open_reports": number,"pending_verifications": number,"pets": number,"total_users": number,"verified_users": number
            }[]
                           },
"am_i_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"ban_user":
{ Args: { "reason": string,"target": string }; Returns: undefined
                           },
"compatibility_score":
{ Args: { "pet_a": string,"pet_b": string }; Returns: number
                           },
"get_my_conversations":
{ Args: Record<PropertyKey, never>; Returns: {
              "conversation_id": string,"event_id": string,"group_id": string,"last_message_at": string,"last_message_body": string,"last_message_type": Database["public"]['Enums']["message_type"],"muted": boolean,"other_user_id": string,"type": Database["public"]['Enums']["conversation_type"],"unread_count": number
            }[]
                           },
"get_my_location":
{ Args: Record<PropertyKey, never>; Returns: {
              "area_name": string,"lat": number,"lng": number
            }[]
                           },
"get_or_create_direct_conversation":
{ Args: { "other_user": string }; Returns: string
                           },
"mark_conversation_read":
{ Args: { "conv": string }; Returns: undefined
                           },
"nearby_pets":
{ Args: { "energies"?: (Database["public"]['Enums']["energy_level"])[],"lat"?: number,"lng"?: number,"max_age_months"?: number,"min_age_months"?: number,"my_pet_id"?: string,"page_offset"?: number,"page_size"?: number,"radius_km"?: number,"sizes"?: (Database["public"]['Enums']["pet_size"])[],"species_filter"?: (Database["public"]['Enums']["pet_species"])[],"temperaments"?: (Database["public"]['Enums']["pet_temperament"])[],"vaccinated_only"?: boolean }; Returns: {
              "age_months": number,"approx_distance_km": number,"area_name": string,"breed": string,"compatibility": number,"energy": Database["public"]['Enums']["energy_level"],"gender": Database["public"]['Enums']["pet_gender"],"likes": (string)[],"name": string,"owner_avatar_url": string,"owner_id": string,"owner_username": string,"pet_id": string,"photo": string,"play_style": Database["public"]['Enums']["play_style"],"size": Database["public"]['Enums']["pet_size"],"species": Database["public"]['Enums']["pet_species"],"temperament": Database["public"]['Enums']["pet_temperament"],"vaccinated": boolean
            }[]
                           },
"resolve_report":
{ Args: { "decision": Database["public"]['Enums']["report_status"],"notes"?: string,"report_id": string }; Returns: undefined
                           },
"respond_to_sniff":
{ Args: { "accept": boolean,"connection_id": string }; Returns: {
              "addressee_id": string,
"created_at": string,
"id": string,
"message": string | null,
"pet_id": string | null,
"requester_id": string,
"responded_at": string | null,
"status": Database["public"]['Enums']["connection_status"],
"target_pet_id": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "connections"
        isOneToOne: true
        isSetofReturn: false
      } },
"review_verification":
{ Args: { "decision": Database["public"]['Enums']["verification_request_status"],"request_id": string,"review_notes"?: string }; Returns: undefined
                           },
"unban_user":
{ Args: { "target": string }; Returns: undefined
                           }
          }
          Enums: {
            "connection_status": "pending"|"accepted"|"declined","conversation_type": "direct"|"group"|"event","energy_level": "low"|"medium"|"high","message_privacy": "everyone"|"connections","message_type": "text"|"image"|"location"|"invite","pet_gender": "male"|"female"|"unknown","pet_size": "small"|"medium"|"large"|"giant","pet_species": "dog"|"cat"|"bird"|"rabbit"|"other","pet_temperament": "friendly"|"shy"|"reactive","play_style": "chaser"|"wrestler"|"gentle","report_reason": "spam"|"harassment"|"inappropriate"|"fake_profile"|"animal_welfare"|"scam"|"unsafe_meetup"|"other","report_status": "open"|"resolved"|"dismissed","report_target": "profile"|"pet"|"message"|"group"|"event"|"post"|"comment","verification_method": "email"|"photo"|"phone"|"id","verification_request_status": "pending"|"approved"|"rejected"|"needs_info","verification_status": "unverified"|"pending"|"verified"|"rejected"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "connection_status": ["pending", "accepted", "declined"],"conversation_type": ["direct", "group", "event"],"energy_level": ["low", "medium", "high"],"message_privacy": ["everyone", "connections"],"message_type": ["text", "image", "location", "invite"],"pet_gender": ["male", "female", "unknown"],"pet_size": ["small", "medium", "large", "giant"],"pet_species": ["dog", "cat", "bird", "rabbit", "other"],"pet_temperament": ["friendly", "shy", "reactive"],"play_style": ["chaser", "wrestler", "gentle"],"report_reason": ["spam", "harassment", "inappropriate", "fake_profile", "animal_welfare", "scam", "unsafe_meetup", "other"],"report_status": ["open", "resolved", "dismissed"],"report_target": ["profile", "pet", "message", "group", "event", "post", "comment"],"verification_method": ["email", "photo", "phone", "id"],"verification_request_status": ["pending", "approved", "rejected", "needs_info"],"verification_status": ["unverified", "pending", "verified", "rejected"]
          }
        }
} as const
