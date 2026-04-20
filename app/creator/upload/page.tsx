import UploadPhotoForm from "../../components/photos/UploadPhotoForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreatorUploadPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "creator") {
    redirect("/photos");
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top,#12345c_0%,#0b1224_38%,#08101d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <UploadPhotoForm />
    </div>
  );
}
