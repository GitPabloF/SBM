export async function apiFetch<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {})
        },
    })
    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Request failed")
    }
    return res.json()
}