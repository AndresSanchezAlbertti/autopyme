export const dynamic = "force-dynamic";

// Esta página nunca se ve — el middleware redirige / → /dashboard
// Su único propósito es evitar que Next.js genere una página virtual aquí.
export default function GroupRootPage() {
  return null;
}
