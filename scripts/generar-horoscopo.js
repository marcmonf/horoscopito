const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
    max_tokens: 1200,
    temperature: 0.68,
    messages: [{
      role: "user",
      content: `Escribe el horóscopo de hoy para ${signo.nombre} de forma corta y elegante.

Planeta regente: ${regente}

Reglas OBLIGATORIAS:
- Horóscopo principal: máximo 5-6 frases cortas.
- Luego genera 4 cajitas cortas y coherentes:
  - Amor (2-3 frases)
  - Trabajo (2-3 frases)
  - Dinero (2-3 frases)
  - Salud (2-3 frases)
- Al final genera 4 puntuaciones coherentes (1-10) según el tono del texto:
  - Amor: X/10
  - Trabajo: X/10
  - Dinero: X/10
  - Salud: X/10

Mantén el mismo estilo suave y refinado. Devuelve SOLO texto puro con este formato exacto:

HOROSCOPO:
[texto]

AMOR:
[texto]

TRABAJO:
[texto]

DINERO:
[texto]

SALUD:
[texto]

PUNTUACIONES:
Amor: X/10
Trabajo: X/10
Dinero: X/10
Salud: X/10`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, nuevoTexto) {
  const filePath = path.join(__dirname, '..', signo.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Horóscopo de hoy
  const regexDia = /<!-- HOROSCOPO_DIA_START -->[\s\S]*?<!-- HOROSCOPO_DIA_END -->/g;
  const replacementDia = `<!-- HOROSCOPO_DIA_START -->\n<p class="horoscope-text">${nuevoTexto}</p>\n<!-- HOROSCOPO_DIA_END -->`;
  content = content.replace(regexDia, replacementDia);

  // 2. Cajitas
  const regexAmor = /<div class="area-title">Amor<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexTrabajo = /<div class="area-title">Trabajo<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexDinero = /<div class="area-title">Dinero<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexSalud = /<div class="area-title">Salud<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;

  const amorMatch = nuevoTexto.match(/AMOR:\s*([\s\S]*?)(?=TRABAJO:|DINERO:|SALUD:|PUNTUACIONES:|$)/i);
  const trabajoMatch = nuevoTexto.match(/TRABAJO:\s*([\s\S]*?)(?=DINERO:|SALUD:|PUNTUACIONES:|$)/i);
  const dineroMatch = nuevoTexto.match(/DINERO:\s*([\s\S]*?)(?=SALUD:|PUNTUACIONES:|$)/i);
  const saludMatch = nuevoTexto.match(/SALUD:\s*([\s\S]*?)(?=PUNTUACIONES:|$)/i);

  if (amorMatch) content = content.replace(regexAmor, `<div class="area-title">Amor</div>\n<div class="area-text">${amorMatch[1].trim()}</div>`);
  if (trabajoMatch) content = content.replace(regexTrabajo, `<div class="area-title">Trabajo</div>\n<div class="area-text">${trabajoMatch[1].trim()}</div>`);
  if (dineroMatch) content = content.replace(regexDinero, `<div class="area-title">Dinero</div>\n<div class="area-text">${dineroMatch[1].trim()}</div>`);
  if (saludMatch) content = content.replace(regexSalud, `<div class="area-title">Salud</div>\n<div class="area-text">${saludMatch[1].trim()}</div>`);

  // 3. Barras de energía (coherentes)
  const amorP = nuevoTexto.match(/Amor:\s*(\d+)\/10/i);
  const trabajoP = nuevoTexto.match(/Trabajo:\s*(\d+)\/10/i);
  const dineroP = nuevoTexto.match(/Dinero:\s*(\d+)\/10/i);
  const saludP = nuevoTexto.match(/Salud:\s*(\d+)\/10/i);

  if (amorP) content = content.replace(/data-width="[^"]*"/, `data-width="${amorP[1]}0%"`);
  if (trabajoP) content = content.replace(/data-width="[^"]*"/, `data-width="${trabajoP[1]}0%"`);
  if (dineroP) content = content.replace(/data-width="[^"]*"/, `data-width="${dineroP[1]}0%"`);
  if (saludP) content = content.replace(/data-width="[^"]*"/, `data-width="${saludP[1]}0%"`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Actualizado completamente: ${signo.file}`);
}

async function main() {
  console.log('🌌 Iniciando generación completa (horóscopo + cajitas + barras de energía)...\n');
 
  for (const signo of SIGNOS) {
    try {
      const texto = await generarContenido(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 950));
    } catch (e) {
      console.error(`❌ Error con ${signo.nombre}:`, e.message);
    }
  }
 
  console.log('\n🎉 Todo actualizado de forma coherente.');
}

main().catch(console.error);
