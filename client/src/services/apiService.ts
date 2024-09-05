// a service layer for api requests that enables reusability of abort controllers
class ApiService {
  private controllers: Map<string, AbortController>;

  constructor() {
    this.controllers = new Map();
  }

  public async makeRequest<T>(
    key: string,
    url: string,
    options?: RequestInit
  ): Promise<T> {
    if (this.controllers.has(key)) {
      this.controllers.get(key)?.abort();
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      const data: T = await response.json();
      return data;
    } finally {
      this.controllers.delete(key);
    }
  }

  public cancelRequest(key: string) {
    if (this.controllers.has(key)) {
      this.controllers.get(key)?.abort();
    }
  }
}

export const apiService = new ApiService();
