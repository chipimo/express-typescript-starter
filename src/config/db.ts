import { env } from '@base/utils/env';
import { toBool } from '@base/utils/to-bool';

const getSslConfig = () => {
  const sslEnabled = env('TYPEORM_SSL');
  const dbHost = env('TYPEORM_HOST');
  
  // If SSL is explicitly disabled, return false
  if (sslEnabled === 'false') {
    return false;
  }

  // If SSL is explicitly enabled, configure it
  if (sslEnabled === 'true') {
    const rejectUnauthorized = env('TYPEORM_SSL_REJECT_UNAUTHORIZED');
    
    // For cloud databases, typically we need rejectUnauthorized: false
    if (rejectUnauthorized === 'false') {
      return {
        rejectUnauthorized: false,
      };
    }
    
    return true;
  }

  // If SSL is not explicitly set, enable it for remote hosts (common for cloud PostgreSQL)
  // Localhost connections typically don't need SSL
  if (dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1') {
    const rejectUnauthorized = env('TYPEORM_SSL_REJECT_UNAUTHORIZED');
    if (rejectUnauthorized === 'false') {
      return {
        rejectUnauthorized: false,
      };
    }
    // Default to requiring SSL but allow self-signed certificates for cloud databases
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
};

const connectionType = (env('TYPEORM_CONNECTION') || 'postgres') as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'better-sqlite3' | 'cockroachdb' | 'mongodb';

const sslConfig = getSslConfig();
const entitiesPath = env('TYPEORM_ENTITIES');

export const dbConfig: any = {
  type: connectionType,
  host: env('TYPEORM_HOST'),
  port: parseInt(env('TYPEORM_PORT') || '5432', 10),
  database: env('TYPEORM_DATABASE'),
  username: env('TYPEORM_USERNAME'),
  password: env('TYPEORM_PASSWORD'),
  entities: entitiesPath ? entitiesPath.split(',') : [],
  logging: toBool(env('TYPEORM_LOGGING')),
  ...(sslConfig && {
    extra: {
      ssl: sslConfig,
    },
  }),
};
