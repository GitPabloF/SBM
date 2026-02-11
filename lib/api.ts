let refreshPromise: Promise<boolean> | null = null
const REFRESH_URL = "/api/auth/refresh-token"
const LOGIN_URL = "/login"

async function refreshAccessToken(): Promise<boolean> {
    if (!refreshPromise) {
        refreshPromise = fetch(REFRESH_URL, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const doFetch = () =>
        fetch(url, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        })

    let res = await doFetch()

    if (res.status === 401 && url !== REFRESH_URL) {
        const refreshed = await refreshAccessToken()

        if (!refreshed) {
            if (typeof window !== "undefined") window.location.href = LOGIN_URL
            throw new Error("SESSION_EXPIRED")
        }

        res = await doFetch()

        if (res.status === 401) {
            if (typeof window !== "undefined") window.location.href = LOGIN_URL
            throw new Error("SESSION_EXPIRED")
        }
    }

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Request failed")
    }

    return res.json()
}
