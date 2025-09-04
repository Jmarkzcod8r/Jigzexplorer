// Shared cache across backend routes
let profileCache: Record<string, any> = {};

export function getProfileFromCache() {
//   if (!email) return profileCache;
  return profileCache || null;
}

export function setProfileInCache(email: string, profile: any) {
  profileCache[email] = profile;
}

export function deleteProfileFromCache(email: string) {
  delete profileCache[email];
}

export function clearProfileCache() {
  profileCache = {};
}
