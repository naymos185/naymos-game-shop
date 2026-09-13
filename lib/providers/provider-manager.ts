import type { GameProvider } from './provider.interface';
import { MockProvider } from './mock-provider';

/**
 * ProviderManager holds registered providers and exposes them by id.
 */
class ProviderManager {
  private providers = new Map<string, GameProvider>();

  constructor() {
    this.register(new MockProvider());
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

  getDefault(): GameProvider {
    const mock = this.providers.get('mock');
    if (mock) return mock;
    const first = this.providers.values().next().value;
    if (!first) {
      throw new Error('No providers registered');
    }
    return first;
  }
}

export const providerManager = new ProviderManager();
