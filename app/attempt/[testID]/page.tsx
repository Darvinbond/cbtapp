"use client"
import React, { useState } from "react";
import AccessPage from "../_components/accessPage";
import { useParams } from "next/navigation";
import CBTPage from "../_components/cbtPage";

type Props = {};

function Page({}: Props) {
  const [haveAccess, setHaveAccess] = useState(false);
    const [accessCode, setAccessCode] = useState<string>("");
    const [questions, setQuestions] = useState<any[]>([]);
  const params = useParams();
  return (
    <>
      {!haveAccess ? (
        <AccessPage
          test_id={params.testID as string}
          setHaveAccess={setHaveAccess}
          accessCode={accessCode}
          setQuestions={setQuestions}
          setAccessCode={setAccessCode}
        />
      ) : (
        <CBTPage
          test_id={params.testID as string}
          accessCode={accessCode}
          questions={questions}
          setHaveAccess={setHaveAccess}
        />
      )}
    </>
  );
}

export default Page;
