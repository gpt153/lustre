import { decodeJwt } from 'jose'

export interface BankIdIdentity {
  personnummer: string
  firstName: string
  lastName: string
}

function getConfig() {
  const domain = process.env.CRIIPTO_DOMAIN
  const clientId = process.env.CRIIPTO_CLIENT_ID
  const clientSecret = process.env.CRIIPTO_CLIENT_SECRET
  const redirectUri = process.env.CRIIPTO_REDIRECT_URI

  if (!domain || !clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required Criipto environment variables: CRIIPTO_DOMAIN, CRIIPTO_CLIENT_ID, CRIIPTO_CLIENT_SECRET, CRIIPTO_REDIRECT_URI',
    )
  }

  return { domain, clientId, clientSecret, redirectUri }
}

/**
 * Returns the Criipto authorize URL to initiate Swedish BankID same-device flow.
 */
export function getAuthorizationUrl(state: string): string {
  const { domain, clientId, redirectUri } = getConfig()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid',
    acr_values: 'urn:grn:authn:se:bankid:same-device',
    state,
  })

  return `https://${domain}/oauth2/authorize?${params.toString()}`
}

/**
 * Exchanges an authorization code for a BankID identity by calling the Criipto token endpoint.
 * Decodes the returned id_token to extract identity claims.
 */
export async function exchangeCodeForIdentity(code: string): Promise<BankIdIdentity> {
  const { domain, clientId, clientSecret, redirectUri } = getConfig()

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const response = await fetch(`https://${domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Criipto token exchange failed (${response.status}): ${errorText}`)
  }

  const tokenResponse = (await response.json()) as { id_token?: string; error?: string }

  if (tokenResponse.error || !tokenResponse.id_token) {
    throw new Error(`Criipto token error: ${tokenResponse.error ?? 'missing id_token'}`)
  }

  const claims = decodeJwt(tokenResponse.id_token)

  // Criipto provides the personnummer in the 'ssn' claim for Swedish BankID.
  // The 'identityscheme' value 'urn:grn:authn:se:bankid:same-device' is also present.
  const personnummer = (claims['ssn'] as string | undefined) ?? (claims['sub'] as string)

  if (!personnummer) {
    throw new Error('BankID id_token is missing personnummer (ssn) claim')
  }

  const firstName = (claims['given_name'] as string | undefined) ?? ''
  const lastName = (claims['family_name'] as string | undefined) ?? ''

  if (!firstName || !lastName) {
    throw new Error('BankID id_token is missing given_name or family_name claims')
  }

  return { personnummer, firstName, lastName }
}
