const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SIGNOS = [
  { nombre: 'Aries',     file: 'aries.html' },
  { nombre: 'Tauro',     file: 'tauro.html' },
  { nombre: 'Géminis',   file: 'geminis.html' },
  { nombre: 'Cáncer',    file: 'cancer.html' },
  { nombre: 'Leo',       file: 'leo.html' },
  { nombre: 'Virgo',     file: 'virgo.html' },
  { nombre: 'Libra',     file: 'libra.html' },
  { nombre: 'Escorpio',  file: 'escorpio.html' },
  { nombre: 'Sagitario', file: 'sagitario.html' },
  { nombre: 'Capricornio', file: 'capricornio.html' },
  { nombre: 'Acuario',   file: 'acuario.html' },
  { nombre: 'Piscis',    file: 'piscis.html' }
];

async function generarHoroscopo(signo) {
  console.log(`🔮 Generando horóscopo para ${signo.nombre}...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 750,
    temperature: 0.65,
    messages: [{
      role: "user",
      content: `Escribe el horóscopo de hoy para ${signo.nombre} exactamente en el mismo estilo elegante y suave que el ejemplo de Leo.

Ejemplo de Leo:
"El Sol, tu regente cósmico, te otorga hoy una presencia magnética que es imposible ignorar..."

Reglas OBLIGATORIAS:
- Usa exactamente el mismo tono poético pero natural.
- Escribe entre 380 y 480 palabras.
- Párrafos cortos y bien espaciados.
- Nunca uses emojis, markdown ni negritas.
- Devuelve SOLO el texto puro (sin etiquetas HTML).`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, nuevoTexto) {
  const filePath = path.join(__dirname, '..', signo.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Reemplazo ULTRA SEGURO: siempre fuerza la etiqueta correcta
  const regex = /<!-- HOROSCOPO_DIA_START -->[\s\S]*?<!-- HOROSCOPO_DIA_END -->/g;
  const replacement = `<!-- HOROSCOPO_DIA_START -->\n<p class="horoscope-text">${nuevoTexto}</p>\n<!-- HOROSCOPO_DIA_END -->`;

  content = content.replace(regex, replacement);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Actualizado correctamente: ${signo.file}`);
}

async function main() {
  console.log('🌌 Iniciando actualización segura de los 12 horóscopos...\n');
  
  for (const signo of SIGNOS) {
    try {
      const texto = await generarHoroscopo(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 900));
    } catch (e) {
      console.error(`❌ Error con ${signo.nombre}:`, e.message);
    }
  }
  
  console.log('\n🎉 Todos los horóscopos han sido actualizados.');
}

main().catch(console.error);
