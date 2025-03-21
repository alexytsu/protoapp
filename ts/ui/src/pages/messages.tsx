import { useCallback, useEffect, useState } from "react";
import { useApiWithToken } from "@/hooks/use-app-state/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const messageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface Message {
  message: string;
  user_fullname: string;
  posted_at: number;
}

export function Messages() {
  const { api, jwt } = useApiWithToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.recent_messages(jwt, {
        page: { offset: 0, limit: 10 },
      });
      setMessages(response.items);
    } finally {
      setIsLoading(false);
    }
  }, [api, jwt]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function onSubmit(values: MessageFormValues) {
    await api.new_message(jwt, { message: values.message });
    form.reset();
    await loadMessages();
  }

  return (
    <div className="p-8 flex flex-col w-full gap-8">
      <h1 className="text-2xl font-bold">Messages</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Post a New Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 flex flex-col"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="self-end"
                type="submit"
                size="sm"
                disabled={isLoading}
              >
                Post Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {isLoading ? (
        <div className="text-center py-4">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-4">No messages yet</div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {[...messages].reverse().map((message) => {
            const postedAt = new Date(message.posted_at);
            return (
              <Card key={message.user_fullname + message.posted_at}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      {message.user_fullname}
                    </div>
                    <div className="italic text-muted-foreground font-normal">
                      {postedAt.toLocaleDateString()}{" "}
                      {postedAt.toLocaleTimeString()}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{message.message}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
