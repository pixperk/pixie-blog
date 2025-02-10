import jwt, { JwtHeader, SigningKeyCallback, VerifyOptions } from 'jsonwebtoken';
import axios from 'axios';

let cachedPublicKeys: Record<string, string> | null = null;
let lastKeyFetchTime = 0;

// Fetch Firebase public keys dynamically
async function getFirebasePublicKeys(): Promise<Record<string, string>> {
  const PUBLIC_KEYS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

  // Cache the public keys for a short period to avoid frequent network requests
  const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
  if (cachedPublicKeys && Date.now() - lastKeyFetchTime < ONE_HOUR) {
    return cachedPublicKeys;
  }

  try {
    const response = await axios.get<Record<string, string>>(PUBLIC_KEYS_URL);
    cachedPublicKeys = response.data;
    lastKeyFetchTime = Date.now();
    return cachedPublicKeys;
  } catch (error) {
    console.error('Error fetching Firebase public keys:', error);
    throw new Error('Unable to fetch Firebase public keys');
  }
}

// Verify the ID token
export async function verifyIdTokenWithoutAdmin(
  idToken: string
): Promise<{ uid: string; [key: string]: any }> {
  try {
    const publicKeys = await getFirebasePublicKeys();
    const decodedHeader = jwt.decode(idToken, { complete: true }) as { header: JwtHeader } | null;

    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new Error('Invalid token header');
    }

    const publicKey = publicKeys[decodedHeader.header.kid];
    if (!publicKey) {
      throw new Error('Public key not found for token');
    }

    const decodedToken = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      audience: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 
      issuer: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`, 
    } as VerifyOptions) as { uid: string; [key: string]: any };

    return decodedToken; // Contains `uid` and other token data
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Token verification failed');
  }
}

// Compare two tokens to check if they belong to the same user
export async function checkIfSameUserWithoutAdmin(tokenA: string, tokenB: string): Promise<boolean> {
  try {
    const decodedTokenA = await verifyIdTokenWithoutAdmin(tokenA);
    const decodedTokenB = await verifyIdTokenWithoutAdmin(tokenB);

    if (decodedTokenA.uid === decodedTokenB.uid) {
      console.log('The tokens belong to the same user.');
      return true;
    } else {
      console.log('The tokens belong to different users.');
      return false;
    }
  } catch (error) {
    console.error('Error comparing users:', error);
    return false;
  }
}
