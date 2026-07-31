# HUNTER STICKERS — catálogo mediante JSON

## Agregar un sticker

1. Guarda la imagen PNG en `assets/stickers/`.
2. Usa un nombre sencillo, en minúsculas y sin espacios. Ejemplo: `perrito-feliz.png`.
3. Agrega un objeto en `data/stickers.json`:

```json
{
  "titulo": "Perrito feliz",
  "archivo": "perrito-feliz",
  "busqueda": "perro mascota alegre"
}
```

`archivo` no lleva `.png`; la web lo agrega automáticamente.

## Importante para probar

Los navegadores suelen bloquear `fetch()` cuando abres `index.html` con doble clic. Para probar el JSON usa GitHub Pages o un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.
