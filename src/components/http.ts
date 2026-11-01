export async function api<T>(
  path: string,
  body?: unknown,
  csrf?: string,
  version?: number,
): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers:
      body === undefined
        ? {}
        : {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf ?? "",
            "Idempotency-Key": crypto.randomUUID(),
            ...(version ? { "If-Match": `"v${version}"` } : {}),
          },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.title ?? "The request could not be completed");
  return data as T;
}

export async function pages<T extends { id: string }>(path: string) {
  const rows: T[] = [];
  let after: string | undefined;
  for (let i = 0; i < 100; i++) {
    const page = await api<T[]>(
      path +
        "?" +
        new URLSearchParams({ limit: "100", ...(after ? { after } : {}) }),
    );
    rows.push(...page);
    if (page.length < 100) return rows;
    after = page.at(-1)!.id;
  }
  throw Error("Too many records to display. Narrow the workspace scope.");
}
