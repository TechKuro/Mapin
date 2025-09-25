import { supabase } from '../supabase/client';

export type CanvasSummary = {
  id: string;
  title: string;
  updated_at: string;
};

export type CanvasData = {
  nodes: unknown[];
  edges: unknown[];
};

export async function listCanvases(): Promise<CanvasSummary[]> {
  const { data, error } = await supabase
    .from('canvases')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCanvas(id: string): Promise<CanvasData | null> {
  const { data, error } = await supabase
    .from('canvases')
    .select('data')
    .eq('id', id)
    .single();
  if (error) throw error;
  return (data?.data as CanvasData) ?? null;
}

export async function createCanvas(title: string): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  const user_id = user.user?.id;
  if (!user_id) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('canvases')
    .insert({ user_id, title, data: { nodes: [], edges: [] } })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function saveCanvas(id: string, payload: CanvasData): Promise<void> {
  const { error } = await supabase
    .from('canvases')
    .update({ data: payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCanvas(id: string): Promise<void> {
  const { error } = await supabase
    .from('canvases')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


