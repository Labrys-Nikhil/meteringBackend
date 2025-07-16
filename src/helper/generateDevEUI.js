const generateDevEUI = (meterSerialNumber, slaveId) => {

  const serialHex = parseInt(meterSerialNumber, 10).toString(16).padStart(14, '0');
  const slaveHex = parseInt(slaveId, 10).toString(16).padStart(2, '0');
  
  
  return `${slaveHex}${serialHex}`.toUpperCase();
}

module.exports = generateDevEUI;