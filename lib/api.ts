let refreshPromise: Promise<boolean> | null = null
const REFRESH_URL = "/api/auth/refresh-token"
const LOGIN_URL = "/login"

export class ApiError extends Error {
    status: number
    details?: unknown
    errorId?: string

    constructor(
        message: string,
        options: { status: number; details?: unknown; errorId?: string },
    ) {
        super(message)
        this.name = "ApiError"
        this.status = options.status
        this.details = options.details
        this.errorId = options.errorId
    }
}

const formatDetails = (details: unknown): string => {
    if (!details || typeof details !== "object") return ""
    const fieldErrors = (details as { fieldErrors?: Record<string, string[]> }).fieldErrors
    if (!fieldErrors) return ""

    const messages = Object.entries(fieldErrors)
        .flatMap(([field, errors]) =>
            (errors ?? []).map((error) => `${field}: ${error}`),
        )
        .filter(Boolean)

    return messages.join(", ")
}

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
        const details = formatDetails(data?.details)
        const baseMessage = data?.error || "Request failed"
        const message = details ? `${baseMessage}. ${details}` : baseMessage
        throw new ApiError(message, {
            status: res.status,
            details: data?.details,
            errorId: data?.errorId,
        })
    }

    return res.json()
}
