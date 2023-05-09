import jwt from "jsonwebtoken";

export default function genToken(
  id: string,
  username: string,
  licenseKey?: string,
  premium?: boolean
) {
  return jwt.sign(
    {
      id: id,
      username: username,
      license_key: licenseKey,
      premium: premium,
    },
    process.env.JWT_SECRET as string,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );
}
