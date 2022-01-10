interface Database<T> {
    executeTransactions(queries:{}):Promise<any>;
  }