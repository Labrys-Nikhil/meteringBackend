
function generateTicketId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const count = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

  // Format: TKT-YYYY-MM-DD-HHMMSS-Count
  return `TKT-${year}-${month}-${day}-${hours}${minutes}${seconds}-${count}`;
}

module.exports = generateTicketId;
