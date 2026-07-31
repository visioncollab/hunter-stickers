// Detección de dispositivo para el popup de descarga
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnDescargaFinal');
  if (!btn) return;

  const esMovil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || window.innerWidth < 768;

  btn.textContent = esMovil
      ? '📱 Guardar en mi teléfono'
      : '💾 Descargar PNG';
});

// Ejemplo:
// <button id="btnDescargaFinal" onclick="descargarSticker(url)">...</button>

async function descargarSticker(url){
  const esMovil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || window.innerWidth < 768;

  if (esMovil && navigator.canShare) {
    try{
      const r = await fetch(url);
      const b = await r.blob();
      const f = new File([b], url.split('/').pop(), {type:'image/png'});
      if (navigator.canShare({files:[f]})){
        await navigator.share({
          files:[f],
          title:'Hunter Stickers'
        });
        return;
      }
    }catch(e){}
  }

  const a=document.createElement('a');
  a.href=url;
  a.download='';
  a.target='_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
