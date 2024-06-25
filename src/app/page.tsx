"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

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
      {/* // page spinner */}
      {getfiles === undefined && (
        <div className="flex flex-col mt-24 items-center">
          <Loader2 className=" h-24 w-24 animate-spin" />
        </div>
      )}

      {getfiles && getfiles.length === 0 && (
        <div className="flex flex-col items-center mt-20 gap-2">
          <Image
            alt="image of an empty file"
            src="/empty.svg"
            width="300"
            height="300"
          />
          <div className="text-xl tracking-tighter">
            You have no files, upload one now
          </div>
          <UploadButton />
        </div>
      )}
      {getfiles && getfiles.length >= 1 && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold tracking-tighter">Your Files</h1>
            <UploadButton />
          </div>
          <div className="mt-10 grid grid-cols-4 gap-4">
            {getfiles?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </>
      )}
    </main>
  );
}
