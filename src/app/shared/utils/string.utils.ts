/**
 * Возвращает инициалы из полного имени (первые буквы первых двух слов).
 * Например: "Магомедов Али Магомедович" → "МА"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
