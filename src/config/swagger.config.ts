import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';

export const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '../../swagger.yaml'), 'utf8'),
) as swaggerUi.JsonObject;
