import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild className="bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600">
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
