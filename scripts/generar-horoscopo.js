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
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

async function generarHoroscopo(signo) {
  console.log(`🔮 Generando horóscopo para ${signo.nombre}...`);

  const mensaje = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    temperature: 0.75,
    messages: [{
      role: "user",
      content: `Escribe el horóscopo diario premium de hoy para ${signo.nombre}. 
Fecha: ${fecha}.
Tono: místico, poético, elegante y esperanzador, pero sin ser cursi.
Estructura exacta:
- Una introducción corta y potente (2-3 frases)
- Sección Amor
- Sección Trabajo / Dinero
- Sección Salud / Bienestar
- Consejo final del cosmos

Máximo 380-420 palabras en total. 
Usa lenguaje bello pero natural. No uses emojis. 
Devuelve SOLO el texto del horóscopo, sin títulos ni explicaciones.`
    }]
  });

  return mensaje.content[0].text.trim();
}

async function actualizarArchivo(signo, textoNuevo) {
  const ruta = path.join(__dirname, '..', signo.archivo);
  
  let contenido = fs.readFileSync(ruta, 'utf8');

  // Marcadores donde se reemplazará el texto
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
  console.log(`✅ Actualizado: ${signo.archivo}`);
}

async function main() {
  console.log('🌌 Iniciando generación de horóscopos diarios...\n');

  for (const signo of SIGNOS) {
    try {
      const texto = await generarHoroscopo(signo);
      await actualizarArchivo(signo, texto);
      // Pequeña pausa para no saturar la API
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.error(`❌ Error con ${signo.nombre}:`, error.message);
    }
  }

  console.log('\n🎉 Todos los horóscopos han sido actualizados correctamente.');
}

main().catch(console.error);
