# Hunter Stickers - catalogo simple

Abre el proyecto con Live Server o publícalo en GitHub Pages para que `catalogo.json` cargue correctamente.

## Agregar un producto

### 1. Añade una entrada en `data/catalogo.json`

Producto gratis:

```json
{
  "codigo": "GR-005",
  "titulo": "Nombre del producto",
  "categoria": "pokemon"
}
```

Producto premium:

```json
{
  "codigo": "PR-007",
  "titulo": "Nombre del producto",
  "categoria": "marvel",
  "precio": 2
}
```

El prefijo decide automáticamente el comportamiento:

- `GR-` = descarga gratis.
- `PR-` = producto premium, Yape y WhatsApp.

### 2. Coloca un único PNG

El PNG debe llamarse exactamente igual que el código.

Ejemplos:

```text
assets/productos/gratis/pokemon/GR-005.png
assets/productos/premium/marvel/PR-007.png
```

No escribas la ruta en el JSON. La web la construye automáticamente.

## Categorías permitidas

- `series`
- `pokemon`
- `pets`
- `marvel`
- `dc`

Las carpetas físicas correspondientes son:

- `series-peliculas`
- `pokemon`
- `mascotas`
- `marvel`
- `dc`

## Wallpapers

Para diferenciar un wallpaper puedes añadir opcionalmente:

```json
"tipo": "wallpaper-celular"
```

o

```json
"tipo": "wallpaper-escritorio"
```

Este campo no cambia la ruta del PNG; solo queda disponible para futuras mejoras o filtros.
