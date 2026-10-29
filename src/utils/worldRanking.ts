const URL = 'https://grggbuwkhxgygiyhgfwa.supabase.co';
const KEY = 'sb_publishable_JLoUriHwbRcXL4czl6yUmw_InCUEYwD';
const SESSION_KEY = 'farm_blocks_auth_session_v1';

type Session = { access_token: string; refresh_token: string; expires_at: number; user: { id: string } };

async function request(path: string, body: object) {
  const response = await fetch(URL + path, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || 'Não foi possível autenticar o jogador.');
  return data;
}

export async function getPlayerSession(): Promise<Session> {
  let stored: Session | null = null;
  try { stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { /* ignore */ }
  if (stored?.access_token && stored.expires_at > Date.now() / 1000 + 60) return stored;
  let data: any;
  if (stored?.refresh_token) {
    try { data = await request('/auth/v1/token?grant_type=refresh_token', { refresh_token: stored.refresh_token }); }
    catch { /* expired session; create new identity */ }
  }
  if (!data) data = await request('/auth/v1/signup', {});
  if (!data.access_token || !data.user?.id) throw new Error('Não foi possível criar a identidade do jogador.');
  const session: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    user: { id: data.user.id },
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function saveWorldRecord(name: string, score: number): Promise<void> {
  const player_name = name.trim();
  if (player_name.length < 1 || player_name.length > 20 || !Number.isSafeInteger(score) || score < 0)
    throw new Error('Informe um apelido de até 20 caracteres.');
  const session = await getPlayerSession();
  const response = await fetch(URL + '/rest/v1/rpc/farm_blocks_submit_score', {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_player_name: player_name, p_score: score }),
  });
  if (!response.ok) throw new Error('Não foi possível salvar. Verifique a configuração do Supabase.');
}

export async function saveFinishedMatch(name: string, score: number, matchId: string): Promise<void> {
  const player_name = name.trim();
  if (player_name.length < 1 || player_name.length > 20 || !Number.isSafeInteger(score) || score < 0)
    throw new Error('Informe um apelido de até 20 caracteres.');
  const session = await getPlayerSession();
  const response = await fetch(URL + '/rest/v1/rpc/farm_blocks_submit_match', {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_match_id: matchId, p_player_name: player_name, p_score: score }),
  });
  if (!response.ok) throw new Error('Não foi possível registrar a partida. Configure a migração SQL dos rankings no Supabase.');
}
