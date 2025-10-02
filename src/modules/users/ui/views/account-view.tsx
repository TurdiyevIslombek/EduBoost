"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const AccountView = () => {

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Manage Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Display name changes have moved. You can now edit your name directly on your profile page via the edit icon next to your name.
          </p>
          <div className="flex justify-end">
            <Button asChild>
              <Link prefetch href="/users/current">Go to My Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
