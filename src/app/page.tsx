"use client";

import { Button } from "@/components/ui/button";

import {
  SignInButton,
  SignedIn,
  SignOutButton,
  SignedOut,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
export default function Home() {
  const createFile = useMutation(api.files.createFile);
  const getfiles = useQuery(api.files.getFiles);

  return (
    <div className="flex min-h-screen justify-center items-center flex-col">
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <Button
        onClick={() => {
          createFile({
            name: "Hello world",
          });
        }}
      >
        Create
      </Button>
      <div className="mt-10">
        {getfiles?.map((file) => <span key={file._id}>{file.name}</span>)}
      </div>
    </div>
  );
}
