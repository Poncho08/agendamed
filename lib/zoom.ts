import type { Consultorio } from "@/types/database"
import { createServiceClient } from "@/lib/supabase/server"

const ZOOM_API = "https://api.zoom.us/v2"

interface ZoomTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function refreshZoomToken(consultorio: Consultorio): Promise<string | null> {
  if (!consultorio.zoom_refresh_token) return null

  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64")

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: consultorio.zoom_refresh_token,
    }),
  })

  if (!res.ok) return null

  const tokens: ZoomTokens = await res.json()
  const expiraEn = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  const supabase = createServiceClient()
  await supabase
    .from("consultorios")
    .update({
      zoom_access_token: tokens.access_token,
      zoom_refresh_token: tokens.refresh_token,
      zoom_token_expira_en: expiraEn,
    })
    .eq("id", consultorio.id)

  return tokens.access_token
}

export async function getZoomToken(consultorio: Consultorio): Promise<string | null> {
  if (!consultorio.zoom_access_token) return null

  const expira = consultorio.zoom_token_expira_en
    ? new Date(consultorio.zoom_token_expira_en)
    : null

  // Refrescar si expira en menos de 5 minutos
  if (!expira || expira.getTime() - Date.now() < 5 * 60 * 1000) {
    return refreshZoomToken(consultorio)
  }

  return consultorio.zoom_access_token
}

export interface ZoomMeeting {
  id: string
  join_url: string
  start_url: string
}

export async function createZoomMeeting(params: {
  consultorio: Consultorio
  topic: string
  startTime: string
  durationMin: number
}): Promise<ZoomMeeting | null> {
  const token = await getZoomToken(params.consultorio)
  if (!token) return null

  const res = await fetch(`${ZOOM_API}/users/me/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: params.topic,
      type: 2, // scheduled
      start_time: params.startTime,
      duration: params.durationMin,
      timezone: "America/Mexico_City",
      settings: {
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: true,
      },
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  return {
    id: String(data.id),
    join_url: data.join_url,
    start_url: data.start_url,
  }
}

export async function deleteZoomMeeting(
  consultorio: Consultorio,
  meetingId: string
): Promise<void> {
  const token = await getZoomToken(consultorio)
  if (!token) return

  await fetch(`${ZOOM_API}/meetings/${meetingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getZoomAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ZOOM_CLIENT_ID!,
    redirect_uri: process.env.ZOOM_REDIRECT_URI!,
  })
  return `https://zoom.us/oauth/authorize?${params}`
}

export async function exchangeZoomCode(code: string): Promise<ZoomTokens | null> {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64")

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.ZOOM_REDIRECT_URI!,
    }),
  })

  if (!res.ok) return null
  return res.json()
}
