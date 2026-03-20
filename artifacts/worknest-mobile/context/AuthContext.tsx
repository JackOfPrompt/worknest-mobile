import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface OrgUser {
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
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  orgUser: OrgUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshOrgUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [orgUser, setOrgUser] = useState<OrgUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("org_users")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (!error && data) {
        setOrgUser(data as OrgUser);
      }
    } catch {}
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOrgUser(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOrgUser(session.user.id);
      } else {
        setOrgUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setOrgUser(null);
  };

  const refreshOrgUser = async () => {
    if (session?.user) await fetchOrgUser(session.user.id);
  };

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    orgUser,
    isLoading,
    signIn,
    signOut,
    refreshOrgUser,
  }), [session, orgUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
