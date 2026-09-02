"use client";
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
import {LoginSchema} from "@/zod-schemas/auth/LoginSchema";
import {z} from "zod";
import {Input} from "@/components/ui/input";
import {PasswordInput} from "@/components/ui/password-Input";
import {Button} from "@/components/ui/button";
import FormError from "@/components/shared/authComponent/FormError";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import Spinner from "@/components/Loader/Spinner";
import {authClient} from "@/lib/auth/auth-client";
import {ErrorContext} from "@better-fetch/fetch";

const Loginform = () => {
  const searchParams = useSearchParams();

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Another account already exists, please use previous account"
      : "";
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    // Trigger pending state immediately so spinner shows before a navigation
    setIsPending(true);

    // Fire sign-in; don't await so the onSuccess callback can redirect immediately
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: () => {
          // keep as a safeguard if authClient calls this
          setIsPending(true);
        },
        onSuccess: () => {
          setIsPending(true);
          window.location.href = "/api/auth/post-login";
        },
        onError: (ctx: ErrorContext) => {
          setError(ctx.error.message ?? "Something went wrong.");
          setIsPending(false);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center md:px-10 w-full"
      >
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
                  disabled={isPending}
                  type="email"
                  placeholder="max@muster.de"
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
                  disabled={isPending}
                  {...field}
                  className="w-full border-b-[0.3px] rounded-md outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={error || urlError} />
        <FormSuccess message={success} />

        <Button
          type="submit"
          disabled={isPending || !form.formState.isValid}
          variant={"default"}
          className="rounded-md w-full bg-primary text-primary-foreground text-sm md:text-md cursor-pointer py-6 mt-5 animate-in transition-all duration-200 ease-in-out hover:shadow-sm shadow-sm hover:shadow-accent-foreground/50 focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-background uppercase"
        >
          {isPending || !form.formState.isValid
            ? "Bitte füllen Sie alle Felder aus"
            : "Login erstellen"}
          {isPending && <Spinner />}
        </Button>
      </form>
    </Form>
  );
};

export default Loginform;
