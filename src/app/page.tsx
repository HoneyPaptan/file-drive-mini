"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";

export default function Home() {
  const user = useUser();
  const organization = useOrganization();

  let orgId: string | undefined = undefined;
  // logic for organization id and if not in an organization then use the user id

  if (organization.isLoaded && user.isLoaded) {
    // when both of these are loaded then set the orgId to one which is present
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const getfiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip"); // if orgId is present then use it otherwise skip

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tighter">Your Files</h1>
        <UploadButton />
      </div>

      <div className="mt-10 grid grid-cols-4 gap-4">
        {getfiles?.map((file) => {
          return <FileCard key={file._id} file={file} />;
        })}
      </div>
    </main>
  );
}
