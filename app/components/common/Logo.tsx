import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  href?: string
  variant?: "primary" | "secondary"
  borderRadius?: string
  transparent?: boolean
  scale?: number
}

export function Logo({
  size = "md",
  withText = true,
  href = "/",
  variant = "primary",
  borderRadius = "rounded-lg", // Default rounded corners
  transparent = false,
  scale = 1.1, // Default scaling factor to make logo slightly larger
}: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const colorClasses = {
    primary: "text-[#4A1D2C]",
    secondary: "text-[#800000]",
  }

  const logoPath = transparent ? "/images/thaitune-logo-transparent.png" : "/images/thaitune-logo.png"

  const logoContent = (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]} overflow-hidden ${borderRadius}`}>
        <Image
          src={logoPath}
          alt="ThaiTune Logo"
          width={512}
          height={512}
          className="object-cover"
          style={{ transform: `scale(${scale})` }}
          priority
        />
      </div>
      {withText && <span className={`text-lg font-bold ${colorClasses[variant]}`}>ThaiTune</span>}
    </div>
  )

  if (href) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}
