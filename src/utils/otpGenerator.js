const generateOTP = (length = 6, expiryMinutes = 10) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    return { otp: otp.toString(), otpExpiresAt };
};

const generateRandomPassWord = (length=8) => {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'[x % 72])
        .join('');
}





module.exports = { generateOTP, generateRandomPassWord };