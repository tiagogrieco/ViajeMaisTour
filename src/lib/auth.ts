import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'Admin' | 'Usuario';
  telefone?: string;
  cargo?: string;
  data_contratacao?: string;
  foto_url?: string;
  status: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


export async function login(email: string, senha: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao autenticar' };
    }

    // 2. Fetch user profile details
    // We try to find the profile by email since the IDs might not match if we just migrated
    // In a clean system, we should link by ID (auth.uid === table.id)
    const { data: profileData, error: profileError } = await supabase
      .from('app_a9fcb610b1_users')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profileData) {
      // Fallback if no profile exists yet (optional: create one?)
      // For now, return error or basic info
      return { success: false, error: 'Perfil de usuário não encontrado.' };
    }

    const user: User = {
      id: profileData.id, // Keep using the profile ID for internal relations
      nome: profileData.nome,
      email: profileData.email,
      tipo: profileData.tipo,
      telefone: profileData.telefone,
      cargo: profileData.cargo,
      data_contratacao: profileData.data_contratacao,
      foto_url: profileData.foto_url,
      status: profileData.status,
      created_at: profileData.created_at,
    };

    // Store profile in localStorage for synchronous access (legacy support)
    // Ideally we should move to async context
    localStorage.setItem('auth_user', JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}


export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem('auth_user');
}


// NOTE: This is still synchronous and relies on localStorage for compatibility.
// It should be refactored to use an async AuthContext.
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}


export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.tipo === 'Admin';
}


// Now creates in Supabase Auth AND Profile table
export async function createUser(userData: {
  nome: string;
  email: string;
  senha: string;
  tipo: 'Admin' | 'Usuario';
  telefone?: string;
  cargo?: string;
  data_contratacao?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isAdmin()) {
      return { success: false, error: 'Apenas administradores podem criar usuários' };
    }

    // 1. Create a secondary Supabase client to avoid logging out the current admin
    // This client uses memory storage so it doesn't persist the session to localStorage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Ensure URL and Key are available
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Supabase URL or Key not configured.' };
    }

    // Create a temporary client with memory storage
    const tempSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: {
          getItem: (_key: string) => null,
          setItem: (_key: string, _value: string) => { },
          removeItem: (_key: string) => { },
        },
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // 2. Sign up the new user in Supabase Auth
    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: userData.senha,
      options: {
        data: {
          nome: userData.nome,
          tipo: userData.tipo,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { success: false, error: 'Email já cadastrado no sistema de autenticação.' };
      }
      console.error('Erro ao criar usuário no Supabase Auth:', authError);
      return { success: false, error: `Erro ao criar usuário: ${authError.message}` };
    }

    if (!authData.user) {
      return { success: false, error: 'Erro inesperado: Usuário não retornado após signup.' };
    }

    // 3. Insert user profile into the database using the ID from Supabase Auth
    const { error: profileError } = await supabase
      .from('app_a9fcb610b1_users')
      .insert({
        id: authData.user.id, // Use the ID from the newly created auth user
        nome: userData.nome,
        email: userData.email,
        senha_hash: 'managed_by_supabase_auth', // Dummy value to satisfy DB constraint
        tipo: userData.tipo,
        telefone: userData.telefone,
        cargo: userData.cargo,
        data_contratacao: userData.data_contratacao,
        status: 'Ativo',
      });

    if (profileError) {
      // If profile insertion fails, consider rolling back the auth user creation (advanced)
      // For now, log the error and return failure.
      console.error('Erro ao inserir perfil de usuário:', profileError);
      // Attempt to delete the auth user if profile creation failed to prevent orphaned auth entries
      await tempSupabase.auth.admin.deleteUser(authData.user.id); // Requires Admin API key or service role
      return { success: false, error: 'Erro ao criar perfil de usuário.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return { success: false, error: 'Erro ao criar usuário' };
  }
}


export async function listUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('app_a9fcb610b1_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      telefone: user.telefone,
      cargo: user.cargo,
      data_contratacao: user.data_contratacao,
      foto_url: user.foto_url,
      status: user.status,
      created_at: user.created_at,
    }));
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return [];
  }
}


export async function updateUser(
  userId: string,
  updates: Partial<{
    nome: string;
    email: string;
    senha: string;
    tipo: 'Admin' | 'Usuario';
    telefone: string;
    cargo: string;
    data_contratacao: string;
    status: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isAdmin()) {
      return { success: false, error: 'Apenas administradores podem editar usuários' };
    }

    const updateData: any = { ...updates };

    // Password updates should be handled via Supabase Auth password reset
    if (updates.senha) {
      delete updateData.senha;
      // TODO: Trigger password reset email or use Admin API
    }

    const { error } = await supabase
      .from('app_a9fcb610b1_users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Erro ao atualizar usuário' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { success: false, error: 'Erro ao atualizar usuário' };
  }
}


export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isAdmin()) {
      return { success: false, error: 'Apenas administradores podem excluir usuários' };
    }

    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      return { success: false, error: 'Você não pode excluir seu próprio usuário' };
    }

    const { error } = await supabase
      .from('app_a9fcb610b1_users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Erro ao excluir usuário' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return { success: false, error: 'Erro ao excluir usuário' };
  }
}