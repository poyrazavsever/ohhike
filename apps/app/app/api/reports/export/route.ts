import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { getPrimaryTeamEntitlement, getTeamEntitlement } from "../../../../lib/billing/entitlements";
import { buildAiReportPdf, reportPdfFilename } from "../../../../lib/reports/pdf";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reportId = request.nextUrl.searchParams.get("reportId")?.trim();

  if (!reportId) {
    return Response.json({ error: "reportId is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: report, error: reportError } = await supabase
    .from("ai_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError || !report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", report.organization_id)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const entitlement = report.team_id
    ? await getTeamEntitlement(report.team_id)
    : await getPrimaryTeamEntitlement(report.organization_id);

  if (!entitlement.pdf_export_enabled) {
    return Response.json(
      { error: "PDF export is available on Pro and Pro Plus team plans." },
      { status: 403 },
    );
  }

  const [{ data: organization }, { data: team }, { data: athlete }, { data: session }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", report.organization_id)
        .maybeSingle(),
      report.team_id
        ? supabase.from("teams").select("name").eq("id", report.team_id).maybeSingle()
        : Promise.resolve({ data: null }),
      report.athlete_id
        ? supabase
            .from("athletes")
            .select("first_name, last_name, number")
            .eq("id", report.athlete_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      report.session_id
        ? supabase.from("sessions").select("title").eq("id", report.session_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const athleteName = athlete
    ? [
        athlete.number ? `#${athlete.number}` : null,
        athlete.first_name,
        athlete.last_name,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  const pdf = buildAiReportPdf({
    organizationName: organization?.name ?? "OhHike",
    branded: entitlement.branded_reports_enabled,
    report: {
      ...report,
      teamName: team?.name ?? null,
      athleteName: athleteName || null,
      sessionTitle: session?.title ?? null,
    },
  });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportPdfFilename(report.title)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
