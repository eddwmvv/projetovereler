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
      alunos: {
        Row: {
          created_at: string
          data_nascimento: string
          empresa_id: string
          escola_id: string
          fase_atual: Database["public"]["Enums"]["student_phase"]
          id: string
          municipio_id: string
          nome_completo: string
          projeto_id: string
          responsavel_legal: string
          sexo: Database["public"]["Enums"]["gender_type"]
          turma_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento: string
          empresa_id: string
          escola_id: string
          fase_atual?: Database["public"]["Enums"]["student_phase"]
          id?: string
          municipio_id: string
          nome_completo: string
          projeto_id: string
          responsavel_legal: string
          sexo?: Database["public"]["Enums"]["gender_type"]
          turma_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string
          empresa_id?: string
          escola_id?: string
          fase_atual?: Database["public"]["Enums"]["student_phase"]
          id?: string
          municipio_id?: string
          nome_completo?: string
          projeto_id?: string
          responsavel_legal?: string
          sexo?: Database["public"]["Enums"]["gender_type"]
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string
          id: string
          nome_fantasia: string
          razao_social: string
          status: Database["public"]["Enums"]["status_type"]
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          id?: string
          nome_fantasia: string
          razao_social: string
          status?: Database["public"]["Enums"]["status_type"]
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          id?: string
          nome_fantasia?: string
          razao_social?: string
          status?: Database["public"]["Enums"]["status_type"]
          updated_at?: string
        }
        Relationships: []
      }
      escola_projetos: {
        Row: {
          created_at: string
          escola_id: string
          id: string
          projeto_id: string
        }
        Insert: {
          created_at?: string
          escola_id: string
          id?: string
          projeto_id: string
        }
        Update: {
          created_at?: string
          escola_id?: string
          id?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_projetos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          municipio_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          municipio_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          municipio_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escolas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escolas_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_fases: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          fase: Database["public"]["Enums"]["student_phase"]
          id: string
          motivo_interrupcao: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["student_phase_status"]
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data?: string
          fase: Database["public"]["Enums"]["student_phase"]
          id?: string
          motivo_interrupcao?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["student_phase_status"]
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          fase?: Database["public"]["Enums"]["student_phase"]
          id?: string
          motivo_interrupcao?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["student_phase_status"]
        }
        Relationships: [
          {
            foreignKeyName: "historico_fases_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      municipio_projetos: {
        Row: {
          created_at: string
          id: string
          municipio_id: string
          projeto_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          municipio_id: string
          projeto_id: string
        }
        Update: {
          created_at?: string
          id?: string
          municipio_id?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipio_projetos_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "municipio_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          created_at: string
          empresa_id: string
          estado: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          estado: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          estado?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          empresa_id: string | null
          id: string
          nome_completo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome_completo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome_completo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          ano_acao: string
          created_at: string
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_type"]
          updated_at: string
        }
        Insert: {
          ano_acao: string
          created_at?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          status?: Database["public"]["Enums"]["status_type"]
          updated_at?: string
        }
        Update: {
          ano_acao?: string
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["status_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: string
          created_at: string
          escola_id: string
          id: string
          nome: string
          serie: string
          status: Database["public"]["Enums"]["status_type"]
          turno: Database["public"]["Enums"]["shift_type"]
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          escola_id: string
          id?: string
          nome: string
          serie: string
          status?: Database["public"]["Enums"]["status_type"]
          turno: Database["public"]["Enums"]["shift_type"]
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          escola_id?: string
          id?: string
          nome?: string
          serie?: string
          status?: Database["public"]["Enums"]["status_type"]
          turno?: Database["public"]["Enums"]["shift_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      gender_type: "masculino" | "feminino" | "outro" | "nao_informado"
      shift_type: "manha" | "tarde" | "integral" | "noite"
      status_type: "ativo" | "inativo" | "finalizado"
      student_phase: "triagem" | "consulta" | "producao_de_oculos" | "entregue"
      student_phase_status:
        | "pendente"
        | "aprovado"
        | "reprovado"
        | "nao_elegivel"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      gender_type: ["masculino", "feminino", "outro", "nao_informado"],
      shift_type: ["manha", "tarde", "integral", "noite"],
      status_type: ["ativo", "inativo", "finalizado"],
      student_phase: ["triagem", "consulta", "producao_de_oculos", "entregue"],
      student_phase_status: [
        "pendente",
        "aprovado",
        "reprovado",
        "nao_elegivel",
      ],
    },
  },
} as const
