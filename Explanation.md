# EXPLANATION

## What was the bug?
The `HttpClient.request` method only handled tokens that were instances of the `OAuth2Token` class. If the token was a plain object like `{ accessToken, expiresAt }`, the code did not refresh it when expired and also did not attach the `Authorization` header.

## Why did it happen?
The implementation relied on `instanceof OAuth2Token`. This works for class instances, but not for plain objects that may come from JSON, storage, or other serialization. Because of this, token-shaped objects were skipped by the refresh and header logic.

## Why does the fix solve it?
The fix adds a small type guard (`isTokenLike`) that detects objects with `accessToken` and `expiresAt` fields. This allows the code to safely handle both real `OAuth2Token` instances and plain token objects. The request logic now correctly checks expiration and sets the `Authorization` header in both cases.

## One edge case not covered
Concurrent requests could trigger multiple token refreshes at the same time. In a real system this could be improved by deduplicating refresh operations.

## References
TypeScript Handbook/docs => Type Guards and Narrowing.