import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import FormContainer from "@/components/custom/FormContainer";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <form className="flex flex-col items-center w-full max-w-sm m-auto">
      <h1 className="text-2xl font-medium">Get started!</h1>
      <p className="text-sm text text-foreground">
        Already have an account?{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          Sign in
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 w-full">
        <FormContainer label="Email address">
          <Input name="email" placeholder="you@example.com" required />
        </FormContainer>
        <FormContainer label="Password">
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
        </FormContainer>
        <Button className="w-max ml-auto mt-[16px]" formAction={signUpAction}>
          <CornerDownLeft /> Sign up
        </Button>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
