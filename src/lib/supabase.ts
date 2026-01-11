/**
 * @module lib/supabase
 * @description Supabase client configuration.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // <--- REPLACE WITH YOUR ENV VAR FROM .ENV
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // <--- REPLACE WITH YOUR ENV VAR FROM .ENV

/**
 * Singleton Supabase client for client-side operations.
 * 
 * Provides access to Auth, Database, and Storage services.
 * RLS (Row Level Security) must be enabled on all tables to ensure data privacy.
 * 
 * @keyTechnologies Supabase
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to Supabase Storage.
 * 
 * Used for storing voice notes (.mp3/wav) and concept snapshots (.png/jpg).
 * 
 * @param bucket - The storage bucket name
 * @param path - The destination path in the bucket
 * @param file - The file object to upload
 */
export async function uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
}
