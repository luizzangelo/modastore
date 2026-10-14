export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      customers: {
        Row: {
          acquired_at: string | null;
          active: boolean;
          created_at: string;
          id: string;
          name: string;
          origin: string;
          phone: string | null;
          store_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          acquired_at?: string | null;
          active?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          origin: string;
          phone?: string | null;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          acquired_at?: string | null;
          active?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          origin?: string;
          phone?: string | null;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          size: string;
          store_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          size: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          size?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_store_id_fkey";
            columns: ["product_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "product_inventory";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "product_variants_product_id_store_id_fkey";
            columns: ["product_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "product_variants_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "product_variants_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          active: boolean;
          cost_price: number;
          created_at: string;
          id: string;
          min_stock: number;
          name: string;
          sale_price: number;
          store_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          cost_price: number;
          created_at?: string;
          id?: string;
          min_stock?: number;
          name: string;
          sale_price: number;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          cost_price?: number;
          created_at?: string;
          id?: string;
          min_stock?: number;
          name?: string;
          sale_price?: number;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      receivable_payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          method: string;
          notes: string | null;
          paid_at: string;
          receivable_id: string;
          reversed_at: string | null;
          store_id: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          method: string;
          notes?: string | null;
          paid_at: string;
          receivable_id: string;
          reversed_at?: string | null;
          store_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          method?: string;
          notes?: string | null;
          paid_at?: string;
          receivable_id?: string;
          reversed_at?: string | null;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receivable_payments_receivable_id_store_id_fkey";
            columns: ["receivable_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "receivables";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivable_payments_receivable_id_store_id_fkey";
            columns: ["receivable_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_with_status";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivable_payments_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "receivable_payments_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      receivables: {
        Row: {
          amount: number;
          canceled_at: string | null;
          created_at: string;
          customer_id: string;
          description: string;
          due_date: string;
          id: string;
          installment_number: number;
          installments_total: number;
          sale_id: string | null;
          store_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          canceled_at?: string | null;
          created_at?: string;
          customer_id: string;
          description: string;
          due_date: string;
          id?: string;
          installment_number: number;
          installments_total: number;
          sale_id?: string | null;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          canceled_at?: string | null;
          created_at?: string;
          customer_id?: string;
          description?: string;
          due_date?: string;
          id?: string;
          installment_number?: number;
          installments_total?: number;
          sale_id?: string | null;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receivables_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customer_summary";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_sale_id_store_id_fkey";
            columns: ["sale_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "receivables_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          sale_id: string;
          size: string;
          store_id: string;
          unit_cost: number;
          unit_price: number;
          variant_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          product_name: string;
          quantity: number;
          sale_id: string;
          size: string;
          store_id: string;
          unit_cost: number;
          unit_price: number;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          sale_id?: string;
          size?: string;
          store_id?: string;
          unit_cost?: number;
          unit_price?: number;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_store_id_fkey";
            columns: ["product_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "product_inventory";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "sale_items_product_id_store_id_fkey";
            columns: ["product_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "sale_items_sale_id_store_id_fkey";
            columns: ["sale_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "sale_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "sale_items_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_variant_id_product_id_store_id_fkey";
            columns: ["variant_id", "product_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id", "product_id", "store_id"];
          },
        ];
      };
      sales: {
        Row: {
          channel: string;
          created_at: string;
          customer_id: string | null;
          entry_mode: string;
          id: string;
          payment_method: string;
          pieces_count: number;
          sold_at: string;
          status: string;
          store_id: string;
          total_amount: number;
          total_cost: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          channel: string;
          created_at?: string;
          customer_id?: string | null;
          entry_mode: string;
          id?: string;
          payment_method: string;
          pieces_count?: number;
          sold_at: string;
          status?: string;
          store_id: string;
          total_amount: number;
          total_cost: number;
          updated_at?: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          customer_id?: string | null;
          entry_mode?: string;
          id?: string;
          payment_method?: string;
          pieces_count?: number;
          sold_at?: string;
          status?: string;
          store_id?: string;
          total_amount?: number;
          total_cost?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customer_summary";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "sales_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "sales_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "sales_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      customer_summary: {
        Row: {
          acquired_at: string | null;
          active: boolean | null;
          created_at: string | null;
          id: string | null;
          last_purchase: string | null;
          name: string | null;
          origin: string | null;
          outstanding_balance: number | null;
          phone: string | null;
          purchases_count: number | null;
          store_id: string | null;
          updated_at: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      product_inventory: {
        Row: {
          active: boolean | null;
          cost_price: number | null;
          created_at: string | null;
          id: string | null;
          min_stock: number | null;
          name: string | null;
          sale_price: number | null;
          stock_status: string | null;
          store_id: string | null;
          total_stock: number | null;
          updated_at: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      receivables_summary: {
        Row: {
          due_next_seven_days: number | null;
          overdue: number | null;
          received_this_month: number | null;
          store_id: string | null;
          total_outstanding: number | null;
        };
        ComputedFields: never;
        Insert: {
          due_next_seven_days?: never;
          overdue?: never;
          received_this_month?: never;
          store_id?: string | null;
          total_outstanding?: never;
        };
        Update: {
          due_next_seven_days?: never;
          overdue?: never;
          received_this_month?: never;
          store_id?: string | null;
          total_outstanding?: never;
        };
        Relationships: [];
      };
      receivables_with_status: {
        Row: {
          amount: number | null;
          balance: number | null;
          canceled_at: string | null;
          computed_status: string | null;
          created_at: string | null;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          description: string | null;
          due_date: string | null;
          id: string | null;
          installment_number: number | null;
          installments_total: number | null;
          paid_amount: number | null;
          sale_id: string | null;
          store_id: string | null;
          updated_at: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "receivables_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customer_summary";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_customer_id_store_id_fkey";
            columns: ["customer_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_sale_id_store_id_fkey";
            columns: ["sale_id", "store_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id", "store_id"];
          },
          {
            foreignKeyName: "receivables_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "receivables_summary";
            referencedColumns: ["store_id"];
          },
          {
            foreignKeyName: "receivables_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      cancel_sale: { Args: { p_sale_id: string }; Returns: undefined };
      create_manual_receivables: {
        Args: {
          p_customer_id: string;
          p_description: string;
          p_first_due_date: string;
          p_installments: number;
          p_total: number;
        };
        Returns: string[];
      };
      create_sale: { Args: { payload: Json }; Returns: string };
      register_receivable_payment: {
        Args: {
          p_amount: number;
          p_method: string;
          p_notes?: string;
          p_paid_at: string;
          p_receivable_id: string;
        };
        Returns: string;
      };
      reverse_receivable_payment: {
        Args: { p_payment_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
