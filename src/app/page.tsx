"use client";

import { Button } from "@/components/ui/button";

import {
  SignInButton,
  SignedIn,
  SignOutButton,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
export default function Home() {
  const user = useUser();
  const organization = useOrganization();
  const createFile = useMutation(api.files.createFile);

  // logic for organisation id and if not in an organization then use the user id
  let orgId = null;
  if (organization.isLoaded && user.isLoaded) {
    // when both of these are loaded then nset the orgid to one which is present
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const getfiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip"); // if orgid is present then use it otherwise skip

  return (
    <div className="flex min-h-screen justify-center items-center flex-col">
      <Button
        onClick={() => {
          if (!orgId) {
            return;
          }
          createFile({
            name: "Hello world",
            orgId: orgId,
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
