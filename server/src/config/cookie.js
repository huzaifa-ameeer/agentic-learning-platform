const isProduction = process.env.NODE_ENV === "production";

// in production the client and the api live on different registrable domains
// (vercel.app vs onrender.com), so the cookie has to be SameSite=None + Secure.
// browsers reject SameSite=None without Secure, hence both flags together.
export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// clear-cookie only works when the attributes match the ones used to set it
export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export default cookieOptions;
