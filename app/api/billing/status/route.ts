import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getBillingSnapshotForUser } from "@/lib/billing";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const billing = await getBillingSnapshotForUser(session.user.id);
    return NextResponse.json({ billing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load billing status." },
      { status: 400 },
    );
  }
}
