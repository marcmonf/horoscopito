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
  console.log(`🔮 Generando horóscopo estilo Leo para ${signo.nombre}...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 700,
    temperature: 0.65,
    messages: [{
      role: "user",
      content: `Escribe un horóscopo diario para ${signo.nombre} hoy.

Quiero exactamente el mismo estilo suave y elegante que este ejemplo:

"El Sol, tu regente cósmico, te otorga hoy una presencia magnética que es imposible ignorar. Entras en los espacios y la energía cambia: eso es Leo en su máximo esplendor. Hoy tienes la capacidad de inspirar, liderar y crear con una autenticidad que pocas personas pueden igualar. El reconocimiento que buscas llegará, pero el mayor regalo de hoy es la satisfacción que sientes cuando expresas tu yo más genuino sin filtros. La creatividad es tu superpoder: úsalo."

Características que quiero:
- Texto suave, elegante y refinado
- Párrafos cortos y bien espaciados
- Lenguaje poético pero natural
- Sin emojis, sin markdown, sin negritas
- Tono místico pero discreto
- Longitud moderada (5-7 párrafos cortos)

Devuelve SOLO el texto puro.`
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
  console.log('🌌 Iniciando generación con estilo elegante (como Leo)...\n');

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
