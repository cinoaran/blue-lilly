"use client";
import {isDisposableEmail} from "@/lib/disposable-email-check"; // Importiere die Hilfsfunktion
import {FieldValues, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {RegisterSchema} from "@/zod-schemas/auth/RegisterSchema";
import {z} from "zod";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/ui/password-Input";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import FormError from "@/components/shared/authComponent/FormError";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import {authClient} from "@/lib/auth/auth-client";
import Spinner from "@/components/Loader/Spinner";

const Registerform = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (name === "password") {
        form.setValue("confirmPassword", "");
        form.trigger("confirmPassword");
      }
    });
    return () => subscription.unsubscribe?.();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    // Disposable-Email-Prüfung
    if (isDisposableEmail(data.email)) {
      setError("Wegwerf-E-Mail-Adressen sind nicht erlaubt.");
      return;
    }
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: `/verify-otp?email=${encodeURIComponent(data.email)}`, // ← DAS IST ALLES!
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onSuccess: async () => {
          form.reset();
          setSuccess("Check your email for the verification code.");
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Something went wrong.");
        },
      },
    );
    setIsPending(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center md:px-10 w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({field}: {field: FieldValues}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.name
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Username
              </FormLabel>
              <FormControl>
                <Input
                  aria-label="Username"
                  disabled={isPending}
                  type="text"
                  placeholder="Max Muster"
                  {...field}
                  className="w-full border-b-[0.3px] border-border focus-visible:underlined py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({field}: {field: FieldValues}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.email
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Email
              </FormLabel>
              <FormControl>
                <Input
                  aria-label="Email"
                  disabled={isPending}
                  type="email"
                  placeholder="max@muster.de"
                  {...field}
                  className="w-full border-b-[0.3px] border-border focus-visible:underlined py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                Password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  aria-label="Password"
                  disabled={isPending}
                  {...field}
                  className="w-full border-b-[0.3px] border-border focus-visible:underlined py-5 text-[0.6rem] md:text-lg"
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
                Confirm password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  aria-label="Confirm password"
                  disabled={isPending}
                  {...field}
                  className="w-full border-b-[0.3px] border-border focus-visible:underlined py-6 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          disabled={isPending || !form.formState.isValid}
          variant={"default"}
          className="rounded-md w-full bg-primary text-primary-foreground text-sm md:text-md cursor-pointer py-6 mt-5 animate-in transition-all duration-200 ease-in-out hover:shadow-sm shadow-sm hover:shadow-accent-foreground/50 focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-background uppercase"
        >
          {isPending || !form.formState.isValid
            ? "Bitte füllen Sie alle Felder aus"
            : "Anmeldung"}
          {form.formState.isSubmitting && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default Registerform;
