import type { GameProvider } from './provider.interface';
import { MockProvider } from './mock-provider';
import { HttpProvider } from './http-provider';

class ProviderManager {
  private providers = new Map<string, GameProvider>();

  constructor() {
    this.register(new MockProvider());
    const url = process.env.PROVIDER_API_URL?.trim();
    const key = process.env.PROVIDER_API_KEY?.trim();
    if (url && key) {
      this.register(new HttpProvider(url, key));
    }
  }

  register(provider: GameProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): GameProvider | undefined {
    return this.providers.get(id);
  }

  getAll(): GameProvider[] {
    return Array.from(this.providers.values());
  }

  /** Prefer real HTTP provider when configured */
  getDefault(): GameProvider {
    return this.get('http') ?? this.get('mock')!;
  }
}

export const providerManager = new ProviderManager();
