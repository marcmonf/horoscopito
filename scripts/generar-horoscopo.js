const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Regentes correctos por signo (coherencia total)
const REGENTES = {
  'Aries': 'Marte',
  'Tauro': 'Venus',
  'Géminis': 'Mercurio',
  'Cáncer': 'la Luna',
  'Leo': 'el Sol',
  'Virgo': 'Mercurio',
  'Libra': 'Venus',
  'Escorpio': 'Plutón',
  'Sagitario': 'Júpiter',
  'Capricornio': 'Saturno',
  'Acuario': 'Urano',
  'Piscis': 'Neptuno'
};

const SIGNOS = [
  { nombre: 'Aries', file: 'aries.html' },
  { nombre: 'Tauro', file: 'tauro.html' },
  { nombre: 'Géminis', file: 'geminis.html' },
  { nombre: 'Cáncer', file: 'cancer.html' },
  { nombre: 'Leo', file: 'leo.html' },
  { nombre: 'Virgo', file: 'virgo.html' },
  { nombre: 'Libra', file: 'libra.html' },
  { nombre: 'Escorpio', file: 'escorpio.html' },
  { nombre: 'Sagitario', file: 'sagitario.html' },
  { nombre: 'Capricornio', file: 'capricornio.html' },
  { nombre: 'Acuario', file: 'acuario.html' },
  { nombre: 'Piscis', file: 'piscis.html' }
];

async function generarContenido(signo) {
  const regente = REGENTES[signo.nombre];
  console.log(`🔮 Generando contenido completo para ${signo.nombre}...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 950,
    temperature: 0.68,
    messages: [{
      role: "user",
      content: `Escribe el horóscopo de hoy para ${signo.nombre} de forma corta y elegante.

Planeta regente: ${regente}

Reglas OBLIGATORIAS:
- Horóscopo principal: máximo 5-6 frases cortas.
- Luego genera 4 cajitas cortas y coherentes con el horóscopo principal:
  - Amor (2-3 frases)
  - Trabajo (2-3 frases)
  - Dinero (2-3 frases)
  - Salud (2-3 frases)

Mantén el mismo estilo suave y refinado que el ejemplo de Leo. Devuelve SOLO texto puro.`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, nuevoTexto) {
  const filePath = path.join(__dirname, '..', signo.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Actualizar Horóscopo de hoy (no toca nada del formato)
  const regexDia = /<!-- HOROSCOPO_DIA_START -->[\s\S]*?<!-- HOROSCOPO_DIA_END -->/g;
  const replacementDia = `<!-- HOROSCOPO_DIA_START -->\n<p class="horoscope-text">${nuevoTexto}</p>\n<!-- HOROSCOPO_DIA_END -->`;
  content = content.replace(regexDia, replacementDia);

  // TODO: Aquí añadiremos las cajitas en la siguiente iteración

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Actualizado correctamente: ${signo.file}`);
}

async function main() {
  console.log('🌌 Iniciando generación de horóscopos cortos y coherentes...\n');
 
  for (const signo of SIGNOS) {
    try {
      const texto = await generarContenido(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 900));
    } catch (e) {
      console.error(`❌ Error con ${signo.nombre}:`, e.message);
    }
  }
 
  console.log('\n🎉 Todos los horóscopos han sido actualizados (versión corta y coherente).');
}

main().catch(console.error);
