import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limit by IP — prevents spam registrations
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Massa intents. Torna a intentar-ho en uns minuts." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { nom, cognoms, telefon, email, website } = body;

    // Honeypot: bots fill every visible field including hidden ones; humans never do
    if (website) {
      return NextResponse.json({ message: "Registre creat correctament" }, { status: 201 });
    }

    if (!nom || !cognoms || telefon === undefined || !email) {
      return NextResponse.json(
        { message: "Tots els camps són obligatoris" },
        { status: 400 }
      );
    }

    if (typeof telefon !== "number" || isNaN(telefon)) {
      return NextResponse.json(
        { message: "El número de telèfon ha de ser un número vàlid" },
        { status: 400 }
      );
    }

    // Validate Spanish phone format: 9 digits, starts with 6, 7 or 9
    if (!/^[679]\d{8}$/.test(telefon.toString())) {
      return NextResponse.json(
        { message: "Número invàlid. Ha de tenir 9 dígits i començar per 6, 7 o 9.", code: "INVALID_PHONE" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Correu electrònic invàlid." },
        { status: 400 }
      );
    }

    const sql = getDb();

    const existing = await sql`SELECT id FROM registres WHERE telefon = ${telefon}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Número de telèfon ja inscrit.", code: "PHONE_EXISTS" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO registres (nom, cognoms, telefon, email)
      VALUES (${nom}, ${cognoms}, ${telefon}, ${email})
    `;

    return NextResponse.json({ message: "Registre creat correctament" }, { status: 201 });
  } catch (error) {
    console.error("Error creating registre:", error);
    return NextResponse.json({ message: "Error intern del servidor" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Protect with a secret token — access via /api/registre?secret=YOUR_ADMIN_SECRET
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "No autoritzat" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const registres = await sql`SELECT * FROM registres ORDER BY created_at DESC`;
    return NextResponse.json(registres);
  } catch (error) {
    console.error("Error fetching registres:", error);
    return NextResponse.json({ message: "Error intern del servidor" }, { status: 500 });
  }
}
