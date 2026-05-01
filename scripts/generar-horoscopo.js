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
    max_tokens: 1100,
    temperature: 0.68,
    messages: [{
      role: "user",
      content: `Escribe el horóscopo de hoy para ${signo.nombre} de forma corta y elegante.

Planeta regente: ${regente}

Reglas OBLIGATORIAS:
- Horóscopo principal: máximo 5-6 frases cortas.
- Luego genera exactamente 4 cajitas cortas y coherentes:
  - Amor (2-3 frases)
  - Trabajo (2-3 frases)
  - Dinero (2-3 frases)
  - Salud (2-3 frases)

Mantén el mismo estilo suave y refinado. Devuelve SOLO texto puro con este formato exacto:

HOROSCOPO:
[texto del horóscopo principal]

AMOR:
[texto de amor]

TRABAJO:
[texto de trabajo]

DINERO:
[texto de dinero]

SALUD:
[texto de salud]`
    }]
  });

  return response.content[0].text.trim();
}

async function actualizarArchivo(signo, nuevoTexto) {
  const filePath = path.join(__dirname, '..', signo.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Actualizar Horóscopo de hoy (seguro)
  const regexDia = /<!-- HOROSCOPO_DIA_START -->[\s\S]*?<!-- HOROSCOPO_DIA_END -->/g;
  const replacementDia = `<!-- HOROSCOPO_DIA_START -->\n<p class="horoscope-text">${nuevoTexto}</p>\n<!-- HOROSCOPO_DIA_END -->`;
  content = content.replace(regexDia, replacementDia);

  // 2. Actualizar las 4 cajitas (seguro, no rompe emojis ni estructura)
  const regexAmor = /<div class="area-title">Amor<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexTrabajo = /<div class="area-title">Trabajo<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexDinero = /<div class="area-title">Dinero<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;
  const regexSalud = /<div class="area-title">Salud<\/div>\s*<div class="area-text">[\s\S]*?<\/div>/g;

  // Parsear el texto de Claude
  const amorMatch = nuevoTexto.match(/AMOR:\s*([\s\S]*?)(?=TRABAJO:|DINERO:|SALUD:|$)/i);
  const trabajoMatch = nuevoTexto.match(/TRABAJO:\s*([\s\S]*?)(?=DINERO:|SALUD:|$)/i);
  const dineroMatch = nuevoTexto.match(/DINERO:\s*([\s\S]*?)(?=SALUD:|$)/i);
  const saludMatch = nuevoTexto.match(/SALUD:\s*([\s\S]*?)$/i);

  if (amorMatch) content = content.replace(regexAmor, `<div class="area-title">Amor</div>\n<div class="area-text">${amorMatch[1].trim()}</div>`);
  if (trabajoMatch) content = content.replace(regexTrabajo, `<div class="area-title">Trabajo</div>\n<div class="area-text">${trabajoMatch[1].trim()}</div>`);
  if (dineroMatch) content = content.replace(regexDinero, `<div class="area-title">Dinero</div>\n<div class="area-text">${dineroMatch[1].trim()}</div>`);
  if (saludMatch) content = content.replace(regexSalud, `<div class="area-title">Salud</div>\n<div class="area-text">${saludMatch[1].trim()}</div>`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Actualizado completamente: ${signo.file}`);
}

async function main() {
  console.log('🌌 Iniciando generación completa (horóscopo + 4 cajitas)...\n');
 
  for (const signo of SIGNOS) {
    try {
      const texto = await generarContenido(signo);
      await actualizarArchivo(signo, texto);
      await new Promise(r => setTimeout(r, 950));
    } catch (e) {
      console.error(`❌ Error con ${signo.nombre}:`, e.message);
    }
  }
 
  console.log('\n🎉 Todos los horóscopos y cajitas han sido actualizados.');
}

main().catch(console.error);
