/**
 * Colombian Holidays Utilities
 * Domain-specific logic for calculating Colombian holidays
 */

/**
 * Calcula la fecha de Domingo de Pascua usando el algoritmo de Gauss
 * @param {number} year - Año para calcular
 * @returns {Date} Fecha de Pascua
 */
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Obtiene el último lunes de un mes específico
 * @param {number} year - Año
 * @param {number} month - Mes (0-indexed: 0 = Enero)
 * @returns {Date} Último lunes del mes
 */
export function getLastMondayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const daysToSubtract = (dayOfWeek + 6) % 7;
  lastDay.setDate(lastDay.getDate() - daysToSubtract);
  return lastDay;
}

/**
 * Formatea una fecha como MM-DD
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato MM-DD
 */
export function formatMMDD(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * Obtiene todos los festivos de Colombia para un año específico
 * Incluye la Ley Emiliani ( festivos trasladados al lunes siguiente)
 * @param {number} year - Año para calcular festivos
 * @returns {Array<{date: string, name: string}>} Lista de festivos ordenados
 */
export function getColombianHolidays(year) {
  const holidays = [];

  // 1. Año Nuevo (fijo)
  holidays.push({ date: '01-01', name: 'Año Nuevo' });

  // 2. Día de Reyes - Se pasa al lunes siguiente (Ley Emiliani)
  const reyes = new Date(year, 0, 6);
  const reyesLunes = new Date(reyes);
  reyesLunes.setDate(reyes.getDate() + ((8 - reyes.getDay()) % 7));
  holidays.push({ date: formatMMDD(reyesLunes), name: 'Día de los Reyes Magos' });

  // 3. Día de San José - Último lunes de marzo
  const sanJose = getLastMondayOfMonth(year, 2); // March = 2
  holidays.push({ date: formatMMDD(sanJose), name: 'Día de San José' });

  // Calcular Pascua
  const pascua = getEasterDate(year);

  // 4. Jueves Santo (Pascua - 3 días)
  const juevesSanto = new Date(pascua);
  juevesSanto.setDate(pascua.getDate() - 3);
  holidays.push({ date: formatMMDD(juevesSanto), name: 'Jueves Santo' });

  // 5. Viernes Santo (Pascua - 2 días)
  const viernesSanto = new Date(pascua);
  viernesSanto.setDate(pascua.getDate() - 2);
  holidays.push({ date: formatMMDD(viernesSanto), name: 'Viernes Santo' });

  // 6. Día del Trabajo (fijo)
  holidays.push({ date: '05-01', name: 'Día del Trabajo' });

  // 7. Ascensión del Señor (Pascua + 39 días - se pasa al lunes siguiente)
  const ascension = new Date(pascua);
  ascension.setDate(pascua.getDate() + 39);
  const ascensionLunes = new Date(ascension);
  ascensionLunes.setDate(ascension.getDate() + ((8 - ascension.getDay()) % 7));
  holidays.push({ date: formatMMDD(ascensionLunes), name: 'Ascensión del Señor' });

  // 8. Corpus Christi (Pascua + 60 días - se pasa al lunes siguiente)
  const corpus = new Date(pascua);
  corpus.setDate(pascua.getDate() + 60);
  const corpusLunes = new Date(corpus);
  corpusLunes.setDate(corpus.getDate() + ((8 - corpus.getDay()) % 7));
  holidays.push({ date: formatMMDD(corpusLunes), name: 'Corpus Christi' });

  // 9. Sagrado Corazón (Pascua + 68 días - se pasa al lunes siguiente)
  const sagrado = new Date(pascua);
  sagrado.setDate(pascua.getDate() + 68);
  const sagradoLunes = new Date(sagrado);
  sagradoLunes.setDate(sagrado.getDate() + ((8 - sagrado.getDay()) % 7));
  holidays.push({ date: formatMMDD(sagradoLunes), name: 'Sagrado Corazón de Jesús' });

  // 10. San Pedro y San Pablo - Lunes siguiente al 29 de junio (o 29 si es lunes)
  const sanPedro = new Date(year, 5, 29);
  const sanPedroLunes = new Date(sanPedro);
  sanPedroLunes.setDate(sanPedro.getDate() + ((8 - sanPedro.getDay()) % 7));
  holidays.push({ date: formatMMDD(sanPedroLunes), name: 'San Pedro y San Pablo' });

  // 11. Día de la Independencia (fijo)
  holidays.push({ date: '07-20', name: 'Día de la Independencia' });

  // 12. Batalla de Boyacá (fijo)
  holidays.push({ date: '08-07', name: 'Batalla de Boyacá' });

  // 13. Asunción de la Virgen - Lunes siguiente al 15 de agosto
  const asuncion = new Date(year, 7, 15);
  const asuncionLunes = new Date(asuncion);
  asuncionLunes.setDate(asuncion.getDate() + ((8 - asuncion.getDay()) % 7));
  holidays.push({ date: formatMMDD(asuncionLunes), name: 'Asunción de la Virgen' });

  // 14. Día de la Raza - Lunes siguiente al 12 de octubre
  const raza = new Date(year, 9, 12);
  const razaLunes = new Date(raza);
  razaLunes.setDate(raza.getDate() + ((8 - raza.getDay()) % 7));
  holidays.push({ date: formatMMDD(razaLunes), name: 'Día de la Raza' });

  // 15. Todos los Santos - Lunes siguiente al 1 de noviembre
  const todosSantos = new Date(year, 10, 1);
  const todosSantosLunes = new Date(todosSantos);
  todosSantosLunes.setDate(todosSantos.getDate() + ((8 - todosSantos.getDay()) % 7));
  holidays.push({ date: formatMMDD(todosSantosLunes), name: 'Día de Todos los Santos' });

  // 16. Independencia de Cartagena - Lunes siguiente al 11 de noviembre
  const cartagena = new Date(year, 10, 11);
  const cartagenaLunes = new Date(cartagena);
  cartagenaLunes.setDate(cartagena.getDate() + ((8 - cartagena.getDay()) % 7));
  holidays.push({ date: formatMMDD(cartagenaLunes), name: 'Independencia de Cartagena' });

  // 17. Inmaculada Concepción (fijo)
  holidays.push({ date: '12-08', name: 'Inmaculada Concepción' });

  // 18. Navidad (fijo)
  holidays.push({ date: '12-25', name: 'Navidad' });

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

// Lista de festivos calculada dinámicamente para el año actual
export const COMMON_HOLIDAYS = getColombianHolidays(new Date().getFullYear());
