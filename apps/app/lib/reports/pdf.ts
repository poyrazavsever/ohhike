import {
  parseDrillList,
  parseObservationList,
  parseTrainingPlan,
} from "../ai-report-display";
import type { AiReportWithMeta } from "../workspace";

type PdfInput = {
  organizationName: string;
  report: AiReportWithMeta;
  branded: boolean;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 54;
const TOP = 788;
const LINE_HEIGHT = 14;
const MAX_CHARS = 86;

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");
}

function escapePdfText(value: string) {
  return ascii(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrap(value: string, width = MAX_CHARS) {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= width) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word.length > width ? word.slice(0, width) : word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function buildLines({ organizationName, report, branded }: PdfInput) {
  const tactical = parseObservationList(report.tactical_observations);
  const athleteObs = parseObservationList(report.athlete_observations);
  const loadObs = parseObservationList(report.load_observations);
  const risks = parseObservationList(report.risk_alerts);
  const drills = parseDrillList(report.recommended_drills);
  const plan = parseTrainingPlan(report.next_training_plan);

  const lines: string[] = [
    branded ? organizationName : "OhHike",
    report.title,
    `${report.report_type.replaceAll("_", " ")} | ${formatDate(report.created_at)}`,
    `Team: ${report.teamName ?? "Not linked"} | Athlete: ${report.athleteName ?? "Not linked"}`,
    `Session: ${report.sessionTitle ?? "Not linked"} | Confidence: ${
      report.confidence_score != null
        ? `${Math.round(report.confidence_score * 100)}%`
        : "N/A"
    }`,
    "",
    "Summary",
    ...(report.summary ? wrap(report.summary) : ["No summary provided."]),
  ];

  const sections = [
    ["Tactical", tactical],
    ["Athlete notes", athleteObs],
    ["Load", loadObs],
    ["Risk alerts", risks],
  ] as const;

  for (const [title, items] of sections) {
    if (items.length === 0) {
      continue;
    }

    lines.push("", title);
    for (const item of items) {
      lines.push(...wrap(`- ${item.observation}`));
      if (item.evidence) {
        lines.push(...wrap(`  Evidence: ${item.evidence}`));
      }
    }
  }

  if (drills.length > 0) {
    lines.push("", "Recommended drills");
    for (const drill of drills) {
      lines.push(...wrap(`- ${drill.title}${drill.reason ? `: ${drill.reason}` : ""}`));
    }
  }

  if (plan?.focus || plan?.notes) {
    lines.push("", "Next training plan");
    if (plan.focus) {
      lines.push(...wrap(`Focus: ${plan.focus}`));
    }
    if (plan.notes) {
      lines.push(...wrap(plan.notes));
    }
  }

  return lines;
}

export function buildAiReportPdf(input: PdfInput) {
  const lines = buildLines(input);
  const pageLineCapacity = Math.floor((TOP - 54) / LINE_HEIGHT);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += pageLineCapacity) {
    pages.push(lines.slice(index, index + pageLineCapacity));
  }

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (const pageLines of pages) {
    const contentObjectNumber = objects.length + 2;
    const pageObjectNumber = objects.length + 1;
    pageObjectNumbers.push(pageObjectNumber);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    );

    const content = [
      "BT",
      "/F1 10 Tf",
      `${LEFT} ${TOP} Td`,
      ...pageLines.flatMap((line, index) => [
        index === 0 ? "" : `0 -${LINE_HEIGHT} Td`,
        `(${escapePdfText(line)}) Tj`,
      ]),
      "ET",
    ]
      .filter(Boolean)
      .join("\n");

    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }

  objects[1] =
    `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers
      .map((number) => `${number} 0 R`)
      .join(" ")}] >>`;

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  body += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(body);
}

export function reportPdfFilename(title: string) {
  const slug = ascii(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${slug || "ai-report"}.pdf`;
}
