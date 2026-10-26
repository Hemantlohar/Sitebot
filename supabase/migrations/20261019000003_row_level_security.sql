-- ==============================================================================
-- 003_row_level_security.sql
-- Multi-tenant Row Level Security (RLS) policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable RLS on all tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Policies for: public.websites
-- ------------------------------------------------------------------------------

-- Ensure legacy / insecure policies are dropped
DROP POLICY IF EXISTS "Public widget can view active bot config" ON public.websites;
DROP POLICY IF EXISTS "Users can view their own websites" ON public.websites;
DROP POLICY IF EXISTS "Users can create websites" ON public.websites;
DROP POLICY IF EXISTS "Users can update their own websites" ON public.websites;
DROP POLICY IF EXISTS "Users can delete their own websites" ON public.websites;

-- Bot owners can read their own bots
CREATE POLICY "Users can view their own websites"
ON public.websites FOR SELECT
USING (auth.uid() = user_id);

-- Bot owners can insert new bots
CREATE POLICY "Users can create websites"
ON public.websites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Bot owners can update their own bots
CREATE POLICY "Users can update their own websites"
ON public.websites FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Bot owners can delete their own bots
CREATE POLICY "Users can delete their own websites"
ON public.websites FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. Policies for: public.website_chunks
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view chunks for their websites" ON public.website_chunks;
DROP POLICY IF EXISTS "Users can insert chunks for their websites" ON public.website_chunks;
DROP POLICY IF EXISTS "Users can update chunks for their websites" ON public.website_chunks;
DROP POLICY IF EXISTS "Users can delete chunks for their websites" ON public.website_chunks;

-- Bot owners can view their bot's knowledge chunks
CREATE POLICY "Users can view chunks for their websites"
ON public.website_chunks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.website_chunks.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- Bot owners can insert knowledge chunks for their bots
CREATE POLICY "Users can insert chunks for their websites"
ON public.website_chunks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.website_chunks.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- Bot owners can update knowledge chunks for their bots
CREATE POLICY "Users can update chunks for their websites"
ON public.website_chunks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.website_chunks.website_id
          AND public.websites.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.website_chunks.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- Bot owners can delete knowledge chunks for their bots
CREATE POLICY "Users can delete chunks for their websites"
ON public.website_chunks FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.website_chunks.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- 4. Policies for: public.chat_messages
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public widget can insert chat messages for active bots" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view chat messages for their websites" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages for their websites" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete chat messages for their websites" ON public.chat_messages;

-- Bot owners can view chat messages for their bots
CREATE POLICY "Users can view chat messages for their websites"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.chat_messages.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- Bot owners can insert chat messages (e.g. testing in playground)
CREATE POLICY "Users can insert chat messages for their websites"
ON public.chat_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.chat_messages.website_id
          AND public.websites.user_id = auth.uid()
    )
);

-- Bot owners can delete chat messages for their bots
CREATE POLICY "Users can delete chat messages for their websites"
ON public.chat_messages FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.websites
        WHERE public.websites.id = public.chat_messages.website_id
          AND public.websites.user_id = auth.uid()
    )
);
