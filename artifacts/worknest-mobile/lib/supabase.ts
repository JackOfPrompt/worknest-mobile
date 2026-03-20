import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      org_users: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          full_name: string;
          role: "employee" | "manager" | "hr" | "admin";
          department: string | null;
          position: string | null;
          employee_id: string | null;
          avatar_url: string | null;
          phone: string | null;
          manager_id: string | null;
          join_date: string | null;
          created_at: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          punch_in: string;
          punch_out: string | null;
          date: string;
          status: "present" | "absent" | "half_day" | "late";
          notes: string | null;
          created_at: string;
        };
      };
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          type: "annual" | "sick" | "personal" | "maternity" | "paternity" | "unpaid";
          start_date: string;
          end_date: string;
          days: number;
          reason: string;
          status: "pending" | "approved" | "rejected";
          approver_id: string | null;
          approver_notes: string | null;
          created_at: string;
        };
      };
      payslips: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          month: string;
          year: number;
          basic_salary: number;
          allowances: number;
          deductions: number;
          net_salary: number;
          status: "draft" | "published";
          created_at: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          content: string;
          author_id: string;
          priority: "low" | "medium" | "high";
          created_at: string;
        };
      };
    };
  };
};
