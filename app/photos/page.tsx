import { Suspense } from "react";
import PhotoGallery from "../components/photos/PhotoGallery";

export default function PhotosPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top,#12345c_0%,#0b1224_38%,#08101d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-center text-cyan-200">Loading photos...</p>}>
        <PhotoGallery />
      </Suspense>
    </div>
  );
}
