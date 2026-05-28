import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { renderToBuffer } from "@react-pdf/renderer"
import type { DocumentProps } from "@react-pdf/renderer"
import React, { type JSXElementConstructor, type ReactElement } from "react"
import { RecetaPDF } from "@/components/receta-pdf"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { data: receta } = await supabase
    .from("recetas")
    .select("*, paciente:pacientes(*), consultorio:consultorios(*)")
    .eq("id", params.id)
    .single()

  if (!receta) return new NextResponse("Not found", { status: 404 })

  const element = React.createElement(RecetaPDF, { receta }) as unknown as ReactElement<DocumentProps, JSXElementConstructor<DocumentProps>>
  const buffer = await renderToBuffer(element)

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  return new NextResponse(arrayBuffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receta-${receta.folio}.pdf"`,
    },
  })
}
