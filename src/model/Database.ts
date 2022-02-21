/* eslint-disable no-unused-vars */
/**
 * Model class for the database.
 */
interface Database<T> {
    /**
     * Performs a transaction of one or multiple queries on the database. A connection will be
     * retrieved from the connection pool that was setup and this connection will be utilized
     * to perform the queries. If the transaction was successful, the returned {@link Promise}
     * will contain the results of the query. If the transaction failed, the {@link Promise} will
     * contain the error that was thrown.
     *
     * @remarks
     * This method is not covered by unit tests. This might be changed in a future version of
     * the API. However for now this method could result in unexpected behaviour or non-descriptive
     * errors that are a catch-all in the event anything goes wrong.
     *
     * @param queries - the queries to execute. The queries are in a object type array where each query
     * in the array is of the form:
     * ```typescript
     * {
     *      id:number,
     *      query:string,
     *      parameters:(string | number | boolean | JSON | Date | null | undefined)[]
     * }
     * ```
     * @returns The {@link Promise} object holding either the failure or the success.
     */
    executeTransactions(queries:{}):Promise<any>;
  }
