export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: "bold" }}>404</h1>
      <p style={{ color: "#888" }}>Page not found</p>
      <a href="/" style={{ color: "#22c55e" }}>Go home</a>
    </div>
  );
}
