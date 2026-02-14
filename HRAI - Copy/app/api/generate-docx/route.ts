import { NextRequest, NextResponse } from "next/server";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
} from "docx";

export async function POST(req: NextRequest) {
    try {
        const { candidateName, role, content, documentType } = await req.json();
        const docLabel = (documentType || "Offer_Letter").replace(/\s+/g, "_");

        if (!content) {
            return NextResponse.json(
                { error: "Missing content" },
                { status: 400 }
            );
        }

        // Split content into paragraphs and build docx
        const lines = content.split("\n");
        const children: Paragraph[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed) {
                children.push(new Paragraph({ text: "" }));
                continue;
            }

            // Detect headings (ALL CAPS lines or lines with specific patterns)
            const isHeading =
                trimmed === trimmed.toUpperCase() &&
                trimmed.length > 5 &&
                !trimmed.startsWith("•") &&
                !trimmed.startsWith("-");

            if (isHeading && !trimmed.includes(":") && !trimmed.startsWith("$")) {
                children.push(
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 100 },
                        children: [
                            new TextRun({
                                text: trimmed,
                                bold: true,
                                size: 24,
                                font: "Calibri",
                            }),
                        ],
                    })
                );
                continue;
            }

            // Bullet points
            if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                const bulletText = trimmed.replace(/^[•\-]\s*/, "");
                // Check for bold parts (before a colon)
                const colonIdx = bulletText.indexOf(":");
                if (colonIdx > 0) {
                    const boldPart = bulletText.slice(0, colonIdx + 1);
                    const rest = bulletText.slice(colonIdx + 1);
                    children.push(
                        new Paragraph({
                            spacing: { before: 40, after: 40 },
                            indent: { left: 360 },
                            children: [
                                new TextRun({ text: "• ", font: "Calibri", size: 22 }),
                                new TextRun({ text: boldPart, bold: true, font: "Calibri", size: 22 }),
                                new TextRun({ text: rest, font: "Calibri", size: 22 }),
                            ],
                        })
                    );
                } else {
                    children.push(
                        new Paragraph({
                            spacing: { before: 40, after: 40 },
                            indent: { left: 360 },
                            children: [
                                new TextRun({ text: "• " + bulletText, font: "Calibri", size: 22 }),
                            ],
                        })
                    );
                }
                continue;
            }

            // Numbered items
            const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
            if (numMatch) {
                children.push(
                    new Paragraph({
                        spacing: { before: 40, after: 40 },
                        indent: { left: 360 },
                        children: [
                            new TextRun({
                                text: `${numMatch[1]}. ${numMatch[2]}`,
                                font: "Calibri",
                                size: 22,
                            }),
                        ],
                    })
                );
                continue;
            }

            // Regular paragraph — detect bold parts (text between ** or all-caps label: value)
            const parts: TextRun[] = [];
            let remaining = trimmed;

            // Handle key:value lines (bold the key)
            const kvMatch = remaining.match(/^([A-Za-z\s]+):\s(.+)/);
            if (kvMatch && kvMatch[1].length < 30) {
                parts.push(new TextRun({ text: kvMatch[1] + ": ", bold: true, font: "Calibri", size: 22 }));
                parts.push(new TextRun({ text: kvMatch[2], font: "Calibri", size: 22 }));
            } else {
                parts.push(new TextRun({ text: remaining, font: "Calibri", size: 22 }));
            }

            children.push(
                new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: parts,
                })
            );
        }

        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440,
                            },
                        },
                    },
                    children,
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${docLabel}_${(candidateName || "Candidate").replace(/\s+/g, "_")}.docx"`,
            },
        });
    } catch (err: any) {
        console.error("DOCX generation error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to generate document" },
            { status: 500 }
        );
    }
}
