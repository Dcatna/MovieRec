import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/Data/userstore"
import { cn } from "@/lib/utils"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { RefreshCwIcon } from "lucide-react"
import React from "react"
import { Link, useNavigate } from "react-router-dom"


export function SignInPage() {
    const navigate = useNavigate()
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Login
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to sign in
                </p>
              </div>
              <UserAuthFormLogin />
              <p className="px-8 text-center text-sm text-muted-foreground">
                By signing continue, you agree to our{" "}
                <Link
                  to="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <Button onClick={() => navigate("/auth/create")}>
                Create an account
              </Button>
            </div>
          </div>
      </div>
    )
  }

export function SignUpPage() {
  const navigate = useNavigate()
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                to="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <Button onClick={() => navigate("/auth/login")}>
                Login
            </Button>
          </div>
        </div>
    </div>
  )
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthFormLogin({ className, ...props }: UserAuthFormProps) {

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [hasError, setHasError] = React.useState<boolean>(false)
    const signIn = useUserStore(state => state.signIn)
    const navigate = useNavigate();

    async function onSubmit(event: React.SyntheticEvent) {
      event.preventDefault()
      setIsLoading(true)
  
      try {
        // @ts-ignore
        const email = (event.target.email.value as string);
        // @ts-ignore
        const password = (event.target.password.value as string)
        console.log(email + "  " + password)

       if (!email || !password) {
          throw Error("empty fields")
       }

       const res = await signIn(email, password)
        if (res) { 
         setIsLoading(false)
         setHasError(false)
         navigate('/home') 
        } else {
            throw Error("unsuccessful")
        }
      } catch {
        setHasError(true)
        setIsLoading(false)
      }
    }
  
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-2">
            <div className={cn(hasError ? "text-red-500" : "", "grid flex-col")}>
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
              />
               <Input
                className="my-2"
                id="password"
                placeholder="Password"
                type="password"
                autoCapitalize="none"
                autoComplete="none"
                autoCorrect="off"
                disabled={isLoading}
              />
              {hasError ? <div className="mb-2">Unable to sign in try again.</div> : undefined}
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with Email
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" type="button" disabled={isLoading}>
          {isLoading ? (
            <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
      </div>
    )
  }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GitHubLogoIcon className="mr-2 h-4 w-4" />
        )}{" "}
        GitHub
      </Button>
    </div>
  )
}