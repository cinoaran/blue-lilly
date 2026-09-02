"use client";

import {useState, Suspense, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {FieldValues, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {ResetPasswordSchema} from "@/zod-schemas/auth/ResetPasswordSchema";

import {authClient} from "@/lib/auth/auth-client";

import {useRouter} from "next/navigation";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import FormError from "@/components/shared/authComponent/FormError";
import Spinner from "@/components/Loader/Spinner";
import {Button} from "@/components/ui/button";

import {PasswordInput} from "@/components/ui/password-Input";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [formError, setFormError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (name === "password") {
        form.setValue("confirmPassword", "");
      }
    });
    return () => subscription.unsubscribe?.();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof ResetPasswordSchema>) => {
    setIsPending(true);
    const {error} = await authClient.resetPassword({
      newPassword: data.password,
      token: searchParams.get("token") as string,
    });

    if (error) {
      setFormError(error.message);
    } else {
      setSuccess("Password reset done. Redirecting to login.");
      setIsPending(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000); // Show success for 4 seconds before redirect
    }
    setIsPending(false);
  };

  if (error === "INVALID_TOKEN") {
    return (
      <div className="grow flex items-center justify-center p-4">
        <FormError message="Invalid or expired token. Please try again." />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center md:px-10 w-full"
      >
        <FormField
          control={form.control}
          name="password"
          render={({field}: {field: FieldValues}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.password
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Neues Passwort
              </FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={isPending}
                  {...field}
                  className="w-full border-b-[0.3px] rounded-md outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({field}: {field: FieldValues}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.confirmPassword
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Neues Passwort bestätigen
              </FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={isPending}
                  {...field}
                  className="w-full border-b-[0.3px] rounded-md outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error ?? undefined} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          disabled={isPending || !form.formState.isValid}
          variant="default"
          className="rounded-md w-full bg-primary text-primary-foreground text-sm md:text-md cursor-pointer py-6 mt-5 animate-in transition-all duration-200 ease-in-out hover:shadow-sm shadow-sm hover:shadow-accent-foreground/50 focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-background uppercase"
        >
          {isPending || !form.formState.isValid
            ? "Bitte warten..."
            : "Passwort zurücksetzen"}
          {form.formState.isSubmitting && <Spinner />}
        </Button>
        {formError}
      </form>
    </Form>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
