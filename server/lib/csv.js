export function toCsv(rows) {
  if (!rows.length) return ''
  const columns = Object.keys(rows[0])
  const header = columns.join(',')
  const body = rows.map((row) => columns.map((column) => escapeCell(row[column])).join(','))
  return `${[header, ...body].join('\n')}\n`
}

function escapeCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}
