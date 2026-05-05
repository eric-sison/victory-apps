import type { PropsWithChildren } from "react"
import { Geist_Mono, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import { cn } from "@workspace/ui/lib/utils"

// @ts-ignore
import "@workspace/ui/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-svh antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body className="h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
