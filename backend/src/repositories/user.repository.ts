import { supabase } from '@/config/supabase';
import { CreateUserInput, User } from '@/types/user.types';

const USERS_TABLE = 'users';

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: User['role'];
  status: User['status'];
  created_at: string;
  updated_at: string;
}

function toDomain(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data ? toDomain(data as UserRow) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from(USERS_TABLE).select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? toDomain(data as UserRow) : null;
}

export async function findAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as UserRow[]).map(toDomain);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      password_hash: input.passwordHash,
    })
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as UserRow);
}

export interface UpdateUserInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
}

export async function updateUser(id: string, patch: UpdateUserInput): Promise<User> {
  const columnPatch: Record<string, string> = {};
  if (patch.firstName) columnPatch.first_name = patch.firstName;
  if (patch.lastName) columnPatch.last_name = patch.lastName;
  if (patch.email) columnPatch.email = patch.email;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(columnPatch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as UserRow);
}

export async function updatePasswordHash(id: string, passwordHash: string): Promise<void> {
  const { error } = await supabase.from(USERS_TABLE).update({ password_hash: passwordHash }).eq('id', id);
  if (error) throw error;
}

export async function updateStatus(id: string, status: User['status']): Promise<User> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toDomain(data as UserRow);
}
