import { getAuthUser } from "@/lib/auth/get-auth-user";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";

interface BrandLinkProps {
  subtitle: string;
  href?: string;
  titleClassName?: string;
}

export async function BrandLink({
  subtitle,
  href,
  titleClassName = "text-lg font-semibold text-foreground",
}: BrandLinkProps) {
  const authState = href ? null : await getAuthUser();
  const resolvedHref = href ?? (authState ? "/dashboard" : "/");

  return (
    <Link href={resolvedHref} className="space-y-1 rounded-md">
      <p className="devflow-kicker">
        {siteConfig.name}
      </p>
      <h1 className={titleClassName}>{subtitle}</h1>
    </Link>
  );
}
