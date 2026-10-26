-- ==============================================================================
-- 001_initial_schema.sql
-- Core schema definition for websites, website_chunks, and chat_messages
-- ==============================================================================

-- Enable UUID and pgvector extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ------------------------------------------------------------------------------
-- 1. Table: websites
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    website_url TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Other',
    business_type TEXT NOT NULL DEFAULT 'General Business',
    bot_name TEXT NOT NULL,
    welcome_message TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'light',
    suggested_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    primary_color TEXT NOT NULL DEFAULT '#2563eb',
    header_color TEXT NOT NULL DEFAULT '#2563eb',
    widget_position TEXT NOT NULL DEFAULT 'right',
    widget_width INTEGER NOT NULL DEFAULT 350,
    border_radius INTEGER NOT NULL DEFAULT 12,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    website_content TEXT,
    analysis_json JSONB,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Table: website_chunks
-- Vector embedding dimension 768 corresponds to Google Gemini text-embedding-004
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    chunk_text TEXT NOT NULL,
    embedding vector(768),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Table: chat_messages
-- Stores conversation history between website visitors and the AI assistant
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_website_url ON public.websites(website_url);
CREATE INDEX IF NOT EXISTS idx_websites_user_id_url ON public.websites(user_id, website_url);

CREATE INDEX IF NOT EXISTS idx_website_chunks_website_id ON public.website_chunks(website_id);
CREATE INDEX IF NOT EXISTS idx_website_chunks_file_name ON public.website_chunks(website_id, file_name);

CREATE INDEX IF NOT EXISTS idx_chat_messages_website_id ON public.chat_messages(website_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(website_id, created_at DESC);

-- HNSW Vector Index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_website_chunks_embedding_hnsw
ON public.website_chunks
USING hnsw (embedding vector_cosine_ops);

-- ------------------------------------------------------------------------------
-- 5. Automatic updated_at Timestamp Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_websites_updated_at ON public.websites;
CREATE TRIGGER trigger_websites_updated_at
    BEFORE UPDATE ON public.websites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
