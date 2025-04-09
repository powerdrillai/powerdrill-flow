"use client";

import { Label } from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import { Github } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { submitApiCredentials } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

type FormValues = {
  userId: string;
  apiKey: string;
};

// Simplified header with theme toggle and GitHub link
function SimpleHeader() {
  return (
    <div className="bg-background/60 fixed top-0 right-0 left-0 z-50 flex h-12 items-center justify-end overflow-hidden px-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-1">
        <TooltipWrapper title="Open Source on GitHub">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
            <a
              href="https://github.com/powerdrillai/powerdrill-flow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </TooltipWrapper>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function UserSetup() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const logoSrc =
    resolvedTheme === "dark" || resolvedTheme === "system-dark"
      ? "/powerdrill_logo_white.png"
      : "/powerdrill_logo_color.png";

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      userId: "",
      apiKey: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      formData.append("userId", data.userId);
      formData.append("apiKey", data.apiKey);
      const res = await submitApiCredentials(formData);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: (data) => {
      toast.success("API Credentials saved.");
      if (data.success) {
        router.replace("/");
      }
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "API credentials verification failed, please check your input"
      );
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <>
      <SimpleHeader />
      <div className="auth-container from-background to-background/90 relative flex min-h-svh w-full bg-gradient-to-b">
        <div className="flex w-full max-w-md flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full">
            <div className="flex flex-col gap-5">
              <div className="mb-3 flex justify-center">
                <Image
                  src={logoSrc}
                  alt="PowerDrill Logo"
                  width={160}
                  height={35}
                  priority
                  className="h-auto w-[140px] md:w-[160px]"
                />
              </div>
              <Card className="border-primary/5 dark:shadow-primary/10 auth-card-glow w-full shadow-lg backdrop-blur-sm dark:bg-black/40">
                <CardHeader className="text-center">
                  <CardTitle className="text-primary dark:text-primary text-2xl">
                    Start Your Journey
                  </CardTitle>
                  <CardDescription className="dark:text-accent-foreground/80">
                    Unlock 100X Productivity with AI Data Analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="userId" className="text-foreground/90">
                          User ID
                        </Label>
                        <Input
                          id="userId"
                          placeholder="tmm-..."
                          className="dark:border-primary/20 focus:dark:border-primary/40 dark:bg-black/50"
                          {...register("userId", { required: true })}
                        />
                        {errors.userId && (
                          <p className="text-sm text-red-500">
                            User ID is required
                          </p>
                        )}
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="apiKey" className="text-foreground/90">
                          Project API Key
                        </Label>
                        <Textarea
                          id="apiKey"
                          className="dark:border-primary/20 focus:dark:border-primary/40 resize-none dark:bg-black/50"
                          {...register("apiKey", { required: true })}
                        />
                        {errors.apiKey && (
                          <p className="text-sm text-red-500">
                            Project API Key is required
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full bg-gradient-to-r text-white shadow-md transition-all duration-300 hover:shadow-lg"
                        disabled={isPending || !isValid}
                      >
                        {isPending ? "Verifying..." : "Submit"}
                      </Button>

                      <div className="text-center">
                        <a
                          href="https://docs.powerdrill.ai/enterprise/quick-start"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary/80 hover:text-primary text-sm underline underline-offset-4"
                        >
                          Need help finding your credentials?
                        </a>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
