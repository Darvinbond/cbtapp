import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import FormContainer from "@/components/custom/FormContainer";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
      <form className="flex-1 flex flex-col w-full gap-2 items-center text-foreground [&>input]:mb-6 max-w-sm m-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col w-full gap-2 [&>input]:mb-3 mt-8">
          <FormContainer label="Email address">
            <Input name="email" placeholder="you@example.com" required />
          </FormContainer>
          <Button className="w-max mt-[16px] ml-auto" formAction={forgotPasswordAction}>
            <CornerDownLeft />
            Reset Password
          </Button>
          <FormMessage message={searchParams} />
        </div>
      </form>
  );
}
