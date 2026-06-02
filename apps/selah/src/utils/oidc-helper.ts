import { UserManager, WebStorageStateStore } from "oidc-client-ts";

let _userManager: UserManager | null = null;

export function getUserManager(): UserManager {
  if (!_userManager) {
    _userManager = new UserManager({
      authority: "http://localhost:3000/api",
      client_id: "YZACYnCPOaQDRZtXLVyuOdKfKtoKECvN",
      client_secret: "cExqiBGGkkMFRwaGmnhkZwavCpmSnQYB",
      redirect_uri: "http://localhost:5860/callback",
      response_type: "code",
      scope: "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    });
  }
  return _userManager;
}
