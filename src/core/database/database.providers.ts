import { DataSource } from 'typeorm';
import { join } from 'path';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'admin',
        database: 'helicopters',
        entities: [join(__dirname, '../src/module/**/*.entity{.ts,.js}')],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
