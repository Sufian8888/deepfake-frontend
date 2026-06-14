"use client";

import { PublicNavbar } from "@/components/ui/public-navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageSquare, Bug, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { contactAPI } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await contactAPI.submit(formData);
      setSuccessMessage(response.message || "Your message has been sent successfully.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send your message. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 glow-blue">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-primary text-glow-blue">Contact Us</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have feedback about this system or encountered any issues? Feel
              free to contact us. We value your input and are here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your feedback or issue..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full glow-blue" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    We welcome all feedback about the DeepFake Detection System.
                    Whether you have suggestions for improvements, feature
                    requests, or general comments, we would love to hear from
                    you.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    Report an Issue
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Encountered a bug or technical issue? Please provide as much
                    detail as possible including the steps to reproduce the
                    problem, error messages, and screenshots if applicable.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    We aim to respond to all inquiries within 24-48 hours during
                    business days. For urgent issues, please indicate the
                    priority in your subject line.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
