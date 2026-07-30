# Hunter Stickers v22

Abre el proyecto con Live Server o publícalo en GitHub Pages. Los archivos JSON no cargan correctamente al abrir `index.html` directamente con doble clic.

## Cómo agregar un producto

### 1. Elige la categoría

Los productos están separados en:

```text
data/categorias/
├── pokemon.json
├── marvel.json
├── dc.json
├── pets.json
└── series.json
```

La categoría se detecta automáticamente por el nombre del archivo. Ya no necesitas escribir `"categoria"` dentro de cada producto.

### 2. Añade una entrada

Gratis:

```json
{
  "codigo": "GR-005",
  "titulo": "Nuevo pack gratis"
}
```

Premium:

```json
{
  "codigo": "PR-007",
  "titulo": "Nuevo pack premium",
  "precio": 2
}
```

Para wallpapers puedes añadir:

```json
"tipo": "wallpaper-celular"
```

o:

```json
"tipo": "wallpaper-escritorio"
```

### 3. Coloca el PNG

El nombre debe ser exactamente igual al código.

Ejemplo para `PR-007` dentro de `pokemon.json`:

```text
assets/productos/premium/pokemon/PR-007.png
```

Ejemplo para `GR-005` dentro de `pets.json`:

```text
assets/productos/gratis/mascotas/GR-005.png
```

## Agregar una categoría nueva

1. Crea, por ejemplo, `data/categorias/anime.json`.
2. Añade `"anime.json"` en la lista `archivos` de `data/catalogo.json`.
3. Crea las carpetas correspondientes dentro de `assets/productos/gratis/` y `assets/productos/premium/`.

`data/catalogo.json` ahora es pequeño: solo guarda la configuración general y la lista de archivos de categorías.
