import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth
    .getClaims()
    .catch(() => ({
      data: null,
      error: new Error("Unable to read auth claims"),
    }));

  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    return null;
  }

  return {
    user: {
      id: claims.sub,
      email: claims.email ?? null,
    },
    claims,
  };
}
