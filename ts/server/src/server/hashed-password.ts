import argon2 from "argon2";

/// Make salted hashed password using argon2
export async function makeHashedPassword(plaintextPassword: string): Promise<string> {
  return argon2.hash(plaintextPassword);
}

export async function checkHashedPassword(plaintextPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, plaintextPassword);
  } catch (error) {
    return false;
  }
}
