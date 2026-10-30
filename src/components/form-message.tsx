import { cn } from "@/lib/utils";

/** Message d'erreur ou de succès sous un formulaire, annoncé aux lecteurs d'écran. */
export function FormMessage({
  type = "error",
  children,
}: {
  type?: "error" | "success";
  children?: string;
}) {
  if (!children) return null;
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={cn("text-sm", type === "error" ? "text-destructive" : "text-green-700")}
    >
      {children}
    </p>
  );
}
