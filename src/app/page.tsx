"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});

export default function Home() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const user = useUser();
  const organization = useOrganization();
  const createFile = useMutation(api.files.createFile);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) {
      return;
    }
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0]!.type },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    const promise = createFile({
      name: values.title,
      fileId: storageId,
      orgId: orgId,
    });
    toast.promise(promise, {
      loading: "Uploading your file",
      success: "File Uploaded Successfully",
      error: "Error while uploading. Please try again",
    });
    form.reset();
    setIsDialogOpen(false);
  }
  let orgId: string | undefined = undefined;
  // logic for organization id and if not in an organization then use the user id
  // state for opening and closing dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  if (organization.isLoaded && user.isLoaded) {
    // when both of these are loaded then set the orgId to one which is present
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const getfiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip"); // if orgId is present then use it otherwise skip

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tighter">Your Files</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {}}>Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">
                Upload your file to File-Drive-Mini
              </DialogTitle>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the title" {...field} />
                        </FormControl>

                        <div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                          <Input type="file" {...fileRef} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex gap-1"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className=" h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-10">
        {getfiles?.map((file) => <span key={file._id}>{file.name}</span>)}
      </div>
    </main>
  );
}
