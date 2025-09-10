// const formatPhoneNumber = (phone) => {
//   if (!phone || typeof phone !== "string") return null;

//   // Remove all spaces, dashes, parentheses
//   phone = phone.replace(/[\s\-()]/g, '');

//   // If already in correct E.164 format (+91...), return as-is
//   if (phone.startsWith('+91') && phone.length === 13) {
//     return phone;
//   }

//   // If starts with '91' but missing '+'
//   if (phone.startsWith('91') && phone.length === 12) {
//     return `+${phone}`;
//   }

//   // If starts with '0', remove '0' and add '+91'
//   if (phone.startsWith('0') && phone.length === 11) {
//     return `+91${phone.substring(1)}`;
//   }

//   // If 10-digit number, add '+91'
//   if (phone.length === 10 && /^[6-9]\d{9}$/.test(phone)) {
//     return `+91${phone}`;
//   }

//   // Invalid Format
//   console.warn(`Invalid phone number format: ${phone}`);
//   return null;
// };

const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return null;

  // 1. Clean all characters except digits and +
  phone = phone.replace(/[^\d+]/g, "");

  // 2. If already in correct E.164 for India or Australia → return as-is
  if (/^\+91\d{10}$/.test(phone)) return phone;  // India
  if (/^\+61\d{9}$/.test(phone)) return phone;   // Australia

  // 3. Handle India numbers
  if (/^91\d{10}$/.test(phone)) return `+${phone}`; // missing +
  if (/^0[6-9]\d{9}$/.test(phone)) return `+91${phone.substring(1)}`;
  if (/^[6-9]\d{9}$/.test(phone)) return `+91${phone}`;

  // 4. Handle Australia numbers
  if (/^61\d{9}$/.test(phone)) return `+${phone}`; // missing +
  if (/^04\d{8}$/.test(phone)) return `+61${phone.substring(1)}`;
  if (/^4\d{8}$/.test(phone)) return `+61${phone}`;

  // 5. Fallback → invalid
  console.warn(`Invalid phone number format: ${phone}`);
  return null;
};

// CommonJS export
module.exports = { formatPhoneNumber };