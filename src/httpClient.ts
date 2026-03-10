import { OAuth2Token } from "./tokens";

export type TokenState = OAuth2Token | Record<string, unknown> | null;

type TokenLike = {
  accessToken: string;
  expiresAt: number;
};

function isTokenLike(token: TokenState): token is TokenLike {
  if (!token || typeof token !== "object") return false;

  const obj = token as Record<string, unknown>;

  return (
    typeof obj.accessToken === "string" && typeof obj.expiresAt === "number"
  );
}

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
      let shouldRefresh = false;

      if (!this.oauth2Token) {
        shouldRefresh = true;
      } else if (this.oauth2Token instanceof OAuth2Token) {
        shouldRefresh = this.oauth2Token.expired;
      } else if (isTokenLike(this.oauth2Token)) {
        const now = Math.floor(Date.now() / 1000);
        shouldRefresh = now >= this.oauth2Token.expiresAt;
      } else {
        shouldRefresh = true;
      }

      if (shouldRefresh) {
        this.refreshOAuth2();
      }

      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      } else if (isTokenLike(this.oauth2Token)) {
        headers["Authorization"] = `Bearer ${this.oauth2Token.accessToken}`;
      }
    }

    return { method, path, headers };
  }
}
