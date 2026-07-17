"""
Muestra todas las rutas registradas en FastAPI.
Uso: python scripts/check_routes.py
"""
import sys

try:
    from app.main import app
    print("\n✅ App importada correctamente\n")
    print(f"{'MÉTODO':<10} {'RUTA'}")
    print("-" * 60)
    for route in app.routes:
        methods = ",".join(route.methods) if hasattr(route, "methods") and route.methods else "-"
        print(f"{methods:<10} {route.path}")
    print()
except Exception as e:
    print(f"\n❌ Error al importar la app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
