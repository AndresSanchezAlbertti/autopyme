export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: "bold", color: "#4361ee", margin: 0 }}>404</h1>
      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Página no encontrada</p>
      <a href="/dashboard" style={{ marginTop: "1.5rem", color: "#4361ee", textDecoration: "underline" }}>Volver al inicio</a>
    </div>
  );
}
