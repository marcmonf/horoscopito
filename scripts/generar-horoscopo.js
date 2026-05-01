const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SIGNOS = [
  { nombre: 'Aries',       archivo: 'aries.html' },
  { nombre: 'Tauro',       archivo: 'tauro.html' },
  { nombre: 'Géminis',     archivo: 'geminis.html' },
  { nombre: 'Cáncer',      archivo: 'cancer.html' },
  { nombre: 'Leo',         archivo: 'leo.html' },
  { nombre: 'Virgo',       archivo: 'virgo.html' },
  { nombre: 'Libra',       archivo: 'libra.html' },
  { nombre: 'Escorpio',    archivo: 'escorpio.html' },
  { nombre: 'Sagitario',   archivo: 'sagitario.html' },
  { nombre: 'Capricornio', archivo: 'capricornio.html' },
  { nombre: 'Acuario',     archivo: 'acuario.html' },
  { nombre: 'Piscis',      archivo: 'piscis.html' }
];

async function generarHoroscopo(signo) {
  console.log(`🔮 Generando horóscopo elegante para ${signo.nombre}...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 650,
    temperature: 0.68,
    messages: [{
      role: "user",
      content: `Escribe un horóscopo diario para ${signo.nombre} hoy.

Estilo exacto que quiero:
- Texto elegante, poético pero suave y refinado.
- Párrafos cortos y bien espaciados.
- Sin emojis, sin markdown, sin # ni ##.
- Sin títulos como "Amor:" o "Trabajo:".
- Longitud moderada (aprox 5-7 párrafos cortos).
- Tono místico, inspirador y natural.

Devuelve SOLO el texto puro y limpio del horóscopo.`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, textoNuevo) {
  const ruta = path.join(__dirname, '..', signo.archivo);
  let contenido = fs.readFileSync(ruta, 'utf8');

  const inicio = '<!-- HOROSCOPO_DIA_START -->';
  const fin = '<!-- HOROSCOPO_DIA_END -->';

  const nuevoContenido = contenido.replace(
    new RegExp(`${inicio}[\\s\\S]*?${fin}`),
    `${inicio}\n${textoNuevo}\n${fin}`
  );

  fs.writeFileSync(ruta, nuevoContenido, 'utf8');
  console.log(`✅ Actualizado: ${signo.archivo}`);
}

async function main() {
  console.log('🌌 Iniciando generación con estilo elegante y limpio...\n');

  for (const signo of SIGNOS) {
    try {
      const texto = await generarHoroscopo(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.error(`❌ Error con ${signo.nombre}:`, error.message);
    }
  }

  console.log('\n🎉 Todos los horóscopos actualizados.');
}

main().catch(console.error);
