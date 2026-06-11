-- Fix: push_subscriptions tinha policy "Service role can read all subscriptions"
-- com USING (true) — isso permitia que QUALQUER usuário autenticado lesse
-- todos os endpoints e chaves de push de qualquer tenant.
--
-- A rota push/send agora usa createAdminClient() que tem service_role e
-- ignora RLS nativamente — não precisa de policy aberta.

DROP POLICY IF EXISTS "Service role can read all subscriptions" ON push_subscriptions;

-- A policy "Users can manage own push subscriptions" (FOR ALL USING user_id = auth.uid())
-- já cobre select/insert/update/delete para o usuário dono — não precisa recriar.
