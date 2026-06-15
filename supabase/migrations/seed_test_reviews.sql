-- Insere 3 avaliações de teste para o tenant do carlos
-- Rode no SQL Editor do Supabase e delete depois se quiser

DO $$
DECLARE
  v_tenant_id uuid;
  v_user_id uuid;
BEGIN
  -- Acha o user pelo email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'eng.cegabriel@gmail.com' LIMIT 1;
  -- Acha o tenant do user
  SELECT id INTO v_tenant_id FROM tenants WHERE owner_id = v_user_id LIMIT 1;

  -- Insere 3 avaliações com comentários
  INSERT INTO reviews (tenant_id, rating, comment, reviewer_name, reviewer_email, visible, created_at)
  VALUES
    (v_tenant_id, 5, 'Profissional excepcional! Entregou o projeto antes do prazo e com qualidade muito acima do esperado. Comunicação clara e transparente durante todo o processo.', 'João Mendes', 'joao.mendes@email.com', true, now() - interval '10 days'),
    (v_tenant_id, 5, 'Ótimo engenheiro, muito atencioso e comprometido. O laudo técnico foi feito com riqueza de detalhes e o relatório ficou impecável. Recomendo sem hesitação.', 'Ana Paula Costa', 'ana.costa@construtora.com', true, now() - interval '20 days'),
    (v_tenant_id, 4, 'Trabalho sério e pontual. Domina bem a parte técnica e explica tudo de forma didática para o cliente leigo. Única sugestão é melhorar o tempo de retorno das mensagens.', 'Roberto Silva', 'roberto.silva@empresa.com', true, now() - interval '35 days');

  RAISE NOTICE 'Avaliações inseridas para tenant: %', v_tenant_id;
END $$;
