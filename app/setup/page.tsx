"use client";

import { Label } from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

type FormValues = {
  userId: string;
  apiKey: string;
};

export default function UserSetup() {
  const router = useRouter();

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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="min-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">
                Start Your Powerdrill Journey
              </CardTitle>
              <CardDescription>
                Enter your Powerdrill API credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      placeholder="m@example.com"
                      {...register("userId", { required: true })}
                    />
                    {errors.userId && (
                      <p className="text-sm text-red-500">
                        User ID is required
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Textarea
                      id="apiKey"
                      className="resize-none"
                      {...register("apiKey", { required: true })}
                    />
                    {errors.apiKey && (
                      <p className="text-sm text-red-500">
                        API Key is required
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || !isValid}
                  >
                    {isPending ? "Verifying..." : "Submit"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <a
                    href="https://docs.powerdrill.ai/enterprise/quick-start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Need help finding your credentials?
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
