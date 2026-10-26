-- ==============================================================================
-- 002_vector_search_rpc.sql
-- Vector similarity search RPC function for RAG retrieval
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.match_chunks(
    query_embedding vector(768),
    match_website UUID,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    website_id UUID,
    file_name TEXT,
    chunk_index INT,
    chunk_text TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        wc.id,
        wc.website_id,
        wc.file_name,
        wc.chunk_index,
        wc.chunk_text,
        1 - (wc.embedding <=> query_embedding) AS similarity
    FROM public.website_chunks wc
    WHERE wc.website_id = match_website
      AND wc.embedding IS NOT NULL
    ORDER BY wc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- Function Permissions Hardening
-- Prevent anonymous or unauthorized clients from querying chunks directly via RPC
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.match_chunks(vector(768), UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.match_chunks(vector(768), UUID, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.match_chunks(vector(768), UUID, INT) TO service_role;

