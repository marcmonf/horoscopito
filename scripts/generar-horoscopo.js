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

const fecha = new Date().toLocaleDateString('es-ES', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});

async function generarHoroscopo(signo) {
  console.log(`🔮 Generando horóscopo completo para ${signo.nombre}...`);

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1200,
    temperature: 0.78,
    messages: [{
      role: "user",
      content: `Escribe un horóscopo diario premium y detallado para ${signo.nombre} hoy (${fecha}).

**Requisitos obligatorios:**
- Longitud total: entre 380 y 480 palabras (aprox 7-9 párrafos).
- Tono: místico, poético, elegante, inspirador y con profundidad, pero natural.
- Estructura clara:
  1. Introducción potente (2-3 frases) que conecte con la energía del día.
  2. Sección Amor
  3. Sección Trabajo / Dinero
  4. Sección Salud / Bienestar
  5. Consejo final del cosmos (frase potente)

Todo debe ser coherente: si en el horóscopo general hablas de precaución, las secciones de Amor/Trabajo no pueden contradecirlo.

Devuelve SOLO el texto del horóscopo (sin títulos como "Amor:" o "Trabajo:"), listo para insertar directamente en la página.`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, textoNuevo) {
  const ruta = path.join(__dirname, '..', signo.archivo);
  let contenido = fs.readFileSync(ruta, 'utf8');

  const inicio = '<!-- HOROSCOPO_DIA_START -->';
  const fin = '<!-- HOROSCOPO_DIA_END -->';

  if (!contenido.includes(inicio) || !contenido.includes(fin)) {
    console.error(`❌ No se encontraron marcadores en ${signo.archivo}`);
    return;
  }

  const nuevoContenido = contenido.replace(
    new RegExp(`${inicio}[\\s\\S]*?${fin}`),
    `${inicio}\n${textoNuevo}\n${fin}`
  );

  fs.writeFileSync(ruta, nuevoContenido, 'utf8');
  console.log(`✅ Actualizado correctamente: ${signo.archivo}`);
}

async function main() {
  console.log('🌌 Iniciando generación de horóscopos diarios (versión mejorada)...\n');

  for (const signo of SIGNOS) {
    try {
      const texto = await generarHoroscopo(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 1200)); // pausa para no saturar API
    } catch (error) {
      console.error(`❌ Error con ${signo.nombre}:`, error.message);
    }
  }

  console.log('\n🎉 Todos los horóscopos han sido actualizados.');
}

main().catch(console.error);
