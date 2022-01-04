interface Database<T> {
    create(object: T): Promise<void>;
    get(id: string): Promise<T>;
    getAll(): Promise<T[]>;
    update(id: string, object: T): Promise<void>;
    delete(id: string): Promise<void>;
    executeTransactions(queries:{}):Promise<any>;
    setDBState(state:boolean): void;
  }