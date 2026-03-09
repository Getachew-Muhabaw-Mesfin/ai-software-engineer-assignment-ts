import { OAuth2Token } from "./tokens";
export type TokenState = OAuth2Token | Record<string, unknown> | null;

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> },
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      // Determine if token needs refresh
      let shouldRefresh = false;
      if (!this.oauth2Token) {
        shouldRefresh = true;
      } else {
        // Check if token is expired
        let expired = false;
        if (this.oauth2Token instanceof OAuth2Token) {
          expired = this.oauth2Token.expired;
        } else if (
          typeof this.oauth2Token === "object" &&
          this.oauth2Token !== null &&
          "expiresAt" in this.oauth2Token
        ) {
          const now = Math.floor(Date.now() / 1000);
          expired = now >= (this.oauth2Token as any).expiresAt;
        } else {
          // Not a recognizable token, treat as expired to be safe
          expired = true;
        }
        shouldRefresh = expired;
      }

      if (shouldRefresh) {
        this.refreshOAuth2();
      }

      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      }
    }

    return { method, path, headers };
  }
}
