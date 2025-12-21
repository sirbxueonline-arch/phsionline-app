import { NextResponse } from "next/server";
import { adminDb, verifyToken } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const uid = decoded.uid;

    if (!adminDb) {
      return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const resourcesSnap = await adminDb.collection("resources").where("userId", "==", uid).get();

    const profile = userDoc.exists ? userDoc.data() : null;
    const resources = resourcesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      resourcesCount: resources.length,
      resources
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="studypilot-export.json"'
      }
    });
  } catch (err) {
    console.error("Export error", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
