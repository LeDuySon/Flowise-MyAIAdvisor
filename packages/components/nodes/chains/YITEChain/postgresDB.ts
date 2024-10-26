import { Pool, QueryResult } from 'pg';

// Define the query parameters 
interface QueryParams {
    productIds?: string[];
    providers?: string[];
    minPrice?: number;
    maxPrice?: number;
}

class PostgresDB {
    private pool: Pool
    table_name: string

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_POSTGRES_CONNECTION_STRING,
            ssl: {
                rejectUnauthorized: false // Set this based on your SSL requirements
            }
        });

        console.log('Connect to database with credentials: ', process.env.DATABASE_POSTGRES_CONNECTION_STRING);

        this.table_name = 'product_links'
    }

    async queryData(condition: string): Promise<QueryResult> {
        try {
            // Connect to the PostgreSQL database
            const client = await this.pool.connect();

            // Execute the query
            const result = await client.query(`SELECT * FROM ${this.table_name} WHERE ${condition}`);
            console.log(result.rows);

            // Release the client back to the pool
            client.release();

            // Return the query result
            return result;
        } catch (error) {
            // Handle any errors that occurred during the query
            console.error('Error executing query:', error);
            throw error;
        }
    }

    async queryDataByProductIDs(productIDs: string[]): Promise<QueryResult> {
        try {
            // Connect to the PostgreSQL database
            const client = await this.pool.connect();

            // Execute the query
            const result = await client.query(`SELECT * FROM ${this.table_name} WHERE product_id IN ('${productIDs.join("', '")}')`);
            console.log(result.rows);

            // Release the client back to the pool
            client.release();

            // Return the query result
            return result;
        } catch (error) {
            // Handle any errors that occurred during the query
            console.error('Error executing query:', error);
            throw error;
        }
    }

    private buildQuery(params: QueryParams): { query: string, values: (string | number)[] } {
        let baseQuery = `SELECT product_id, link, price, provider FROM ${this.table_name} WHERE 1=1`; // Base query
        const values: (string | number)[] = [];

        if (params.productIds) {
            if (Array.isArray(params.productIds)) {
                if (Array.isArray(params.productIds) && params.productIds.length > 1) {
                    const placeholders = params.productIds.map((_, i) => `$${values.length + i + 1}`);
                    baseQuery += ` AND product_id IN (${placeholders.join(', ')})`;
                    values.push(...params.productIds);
                } else if (params.productIds.length === 1) {
                    baseQuery += ' AND product_id = $' + (values.length + 1);
                    values.push(params.productIds[0]);
                }
            } else {
                baseQuery += ' AND product_id = $' + (values.length + 1);
                values.push(params.productIds);
            }
        }

        if (params.providers) {
            if (Array.isArray(params.providers)) {
                if (params.providers.length > 1) {
                    const placeholders = params.providers.map((_, i) => `$${values.length + i + 1}`);
                    baseQuery += ` AND provider IN (${placeholders.join(', ')})`;
                    values.push(...params.providers);
                } else if (params.providers.length === 1) {
                    baseQuery += ' AND provider = $' + (values.length + 1);
                    values.push(params.providers[0]);
                }
            } else {
                baseQuery += ' AND provider = $' + (values.length + 1);
                values.push(params.providers);
            }
        }

        if (params.minPrice && params.maxPrice) {
            baseQuery += ` AND price BETWEEN $${values.length + 1} AND $${values.length + 2}`;
            values.push(params.minPrice, params.maxPrice);
        } else if (params.minPrice) {
            baseQuery += ` AND price >= $${values.length + 1}`;
            values.push(params.minPrice);
        } else if (params.maxPrice) {
            baseQuery += ` AND price <= $${values.length + 1}`;
            values.push(params.maxPrice);
        }

        console.log('Query: ', baseQuery);
        console.log('Values: ', values);

        return { query: baseQuery, values };
    }

    public async queryDataByParams(params: QueryParams): Promise<QueryResult> {
        try {
            // Connect to the PostgreSQL database
            const client = await this.pool.connect();

            // Build the query
            const { query, values } = this.buildQuery(params);
            console.log('Query: ', query);

            // Execute the query
            const result = await client.query(query, values);

            // Release the client back to the pool
            client.release();

            // Return the query result
            return result;
        } catch (error) {
            // Handle any errors that occurred during the query
            console.error('Error executing query:', error);
            throw error;
        }
    }

    public async getGeneralContextbyKnowledgeType(knowledgeType: string): Promise<string> {
        try {
            // Connect to the PostgreSQL database
            const client = await this.pool.connect();

            // Execute the query
            const result = await client.query(`SELECT * FROM knowledge_context WHERE knowledge_type = '${knowledgeType}'`);
            console.log("General context: ", result.rows);

            // Release the client back to the pool
            client.release();

            // Return the query result
            if (result.rows.length === 0) {
                return ''
            } else {
                return result.rows[0].general_context
            }

        } catch (error) {
            // Handle any errors that occurred during the query
            console.error('Error executing query:', error);
            throw error;
        }
    }

    public async getGeneralContextbyKnowledgeTypes(knowledgeTypes: string[]): Promise<Record<string, string>> {
        try {
            // Connect to the PostgreSQL database
            const client = await this.pool.connect();           

            const result = await client.query(`SELECT * FROM knowledge_context WHERE knowledge_type IN ('${knowledgeTypes.join("', '")}')`);

            // Release the client back to the pool
            client.release();

            if (result.rows.length === 0) {
                return {}
            } else {
                return result.rows.reduce((acc, row) => {
                    acc[row.knowledge_type] = row.general_context;
                    return acc;
                }, {});
            }
        } catch (error) {
            // Handle any errors that occurred during the query
            console.error('Error executing query:', error);
            throw error;
        }
    }
}

export { PostgresDB, QueryParams, QueryResult };