import { signInAction } from "@/app/actions";
import FormContainer from "@/components/custom/FormContainer";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CornerDownLeft } from "lucide-react";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex items-center m-auto flex-col w-full max-w-sm">
      <h1 className="text-2xl font-medium">Welcome back!</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex w-full flex-col gap-2 [&>input]:mb-3 mt-8">
        <FormContainer label="Email address">
          <Input name="email" placeholder="you@example.com" required />
        </FormContainer>
        <FormContainer label="Password">
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <Link
            className="text-xs ml-auto text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </FormContainer>
        <Button className="w-max ml-auto mt-[16px]" formAction={signInAction}>
          <CornerDownLeft /> Sign in
        </Button>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
