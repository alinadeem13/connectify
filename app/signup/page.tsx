import SignupForm from "../components/signup/SignupForm";
import SignupImage from "../public/assets/Signup.png"


export default function Signup() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-900">
      {/* Image section */}
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1700px] flex-col items-center justify-center gap-8 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-8 lg:px-12">
        <div className="hidden md:flex md:w-[64%] md:justify-start">
          <img
            src={SignupImage.src}
            alt="Signup"
            className="h-[520px] w-full rounded-2xl object-cover lg:h-[620px]"
          />
        </div>

        {/* Form section */}
        <div className="flex w-full justify-center md:w-[36%] md:justify-end">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
