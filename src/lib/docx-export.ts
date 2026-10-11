import type { CvDoc } from "./cv-examples";

/**
 * Builds an editable Word (.docx) CV: one clean column with real headings and
 * bullet lists, which applicant tracking systems read reliably. Loaded only
 * when the student clicks the button, so it never slows the page.
 */
export async function downloadDocx(doc: CvDoc, role: string, accent: string | null, fileName: string) {
  const { AlignmentType, BorderStyle, Document, Packer, Paragraph, TabStopType, TextRun } = await import("docx");

  const color = (accent ?? "#1e3a5f").replace("#", "");
  const FONT = "Calibri";
  const RIGHT = 9638; // right tab stop at the text edge (A4, 2 cm margins), in twips

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 260, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 2 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color, font: FONT, characterSpacing: 20 })],
    });

  const body = (text: string, opts: { bold?: boolean; italic?: boolean } = {}) =>
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text, size: 21, font: FONT, ...opts })] });

  const bullet = (text: string) =>
    new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text, size: 21, font: FONT })] });

  /** "Title — date" on one line, date pushed to the right margin. */
  const entryLine = (left: string, right: string) =>
    new Paragraph({
      spacing: { before: 120, after: 20 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
      children: [
        new TextRun({ text: left, bold: true, size: 22, font: FONT }),
        ...(right ? [new TextRun({ text: `\t${right}`, size: 20, font: FONT, color: "555555" })] : []),
      ],
    });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: doc.name, bold: true, size: 40, color, font: FONT })],
    }),
  ];
  if (role) {
    children.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: role, size: 24, font: FONT, color: "444444" })] }),
    );
  }
  if (doc.contact.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 120 },
        children: [new TextRun({ text: doc.contact.join("  |  "), size: 19, font: FONT, color: "444444" })],
      }),
    );
  }

  if (doc.summary) children.push(heading("Profile"), body(doc.summary));

  if (doc.experience.length) {
    children.push(heading("Experience"));
    for (const j of doc.experience) {
      children.push(entryLine(j.title, j.date));
      if (j.place) children.push(body(j.place, { italic: true }));
      j.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (doc.education.length) {
    children.push(heading("Education"));
    for (const e of doc.education) {
      children.push(entryLine(e.degree, e.date));
      if (e.school) children.push(body(e.school, { italic: true }));
    }
  }

  if (doc.projects?.length) {
    children.push(heading("Projects"));
    for (const p of doc.projects) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${p.name}: `, bold: true, size: 21, font: FONT }),
            new TextRun({ text: p.detail, size: 21, font: FONT }),
          ],
        }),
      );
    }
  }

  if (doc.skills.length) {
    children.push(heading("Skills"));
    doc.skills.forEach((s) => {
      const [label, rest] = s.includes(": ") ? s.split(/: (.+)/) : ["", s];
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            ...(label ? [new TextRun({ text: `${label}: `, bold: true, size: 21, font: FONT })] : []),
            new TextRun({ text: rest, size: 21, font: FONT }),
          ],
        }),
      );
    });
  }

  const extras: [string, string[] | undefined][] = [
    ["Languages", doc.languages],
    ["Certifications", doc.certifications],
    ["Awards", doc.awards],
    ["Interests", doc.interests],
  ];
  for (const [title, items] of extras) {
    if (items?.length) {
      children.push(heading(title));
      items.forEach((i) => children.push(bullet(i)));
    }
  }

  if (doc.references?.length) {
    children.push(heading("References"));
    for (const r of doc.references) {
      children.push(body(r.name, { bold: true }), body(`${r.role}${r.phone ? `  |  ${r.phone}` : ""}`));
    }
  }

  const file = new Document({
    creator: "CV11",
    title: `${doc.name} CV`,
    styles: { default: { document: { run: { font: FONT } } } },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1134, right: 1134 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(file);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
