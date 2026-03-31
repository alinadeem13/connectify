import LoginForm from "../components/login/LoginForm";
import LoginImage from "../public/assets/Signup.png"

export default function Login() {
  return (
    // <div className="flex flex-1 items-center justify-center px-4 py-12">
    //   <LoginForm />
    // </div>
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-900">
      {/* Image section */}
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1700px] flex-col items-center justify-center gap-8 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-8 lg:px-12">
        <div className="hidden md:flex md:w-[58%] md:justify-start">
          <img
            src={LoginImage.src}
            alt="Login"
            className="h-auto w-full object-cover"
          />
        </div>

        {/* Form section */}
        <div className="flex w-full justify-center md:w-[42%] md:justify-end">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
