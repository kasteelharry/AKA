export class MockDatabase<T> implements Database<T> {
    executeTransactions(queries: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    private objects: any[] = [];

    async create(object: T): Promise<void> {
      this.objects.push(object);
    }

    async get(id: string): Promise<T> {
      return this.objects.find(o => o.id === id);
    }

    async getAll(): Promise<T[]> {
      return this.objects;
    }

    update(id: string, object: T): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

  }