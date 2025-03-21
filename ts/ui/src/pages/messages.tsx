import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Messages() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your messages will appear here. This is a placeholder.</p>
        </CardContent>
      </Card>
    </div>
  );
}
