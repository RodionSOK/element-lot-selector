export function formatMoney(value: string): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(value)) + ' ₽'
}

export function formatArea(value: string): string {
  return `${Number(value).toLocaleString('ru-RU')} м²`
}

export const LOT_STATUS_LABELS: Record<string, string> = {
  for_sale: 'В продаже',
  reserved: 'Забронирован',
  sold: 'Продано',
}
