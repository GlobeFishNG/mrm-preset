import { OpenAPI, OpenAPIV3, OpenAPIV2 } from 'openapi-types';
import * as SwaggerParser from 'swagger-parser';
import * as Joi from '@hapi/joi';

// tslint:disable: no-console

export type NgNetwork = 'intranet-network' | 'access-network' | 'internal-data-network';

export type NgApiInfo = NgExternalApiInfo | NgInternalApiInfo;

export interface NgBasicApiInfo {
  network: NgNetwork;
  basePath?: string;
}
export type NgExternalApiInfo = NgBasicApiInfo;

export interface NgInternalApiInfo extends NgBasicApiInfo {
  port: number;
}

export const ngApiInfoJoiSchema = Joi.alternatives().match('all').try(
  Joi.object().keys({
    basePath: Joi.string().min(0).allow('').optional(),
  }),
  Joi.alternatives().match('one').try(
    Joi.object().keys({
      network: Joi.string().valid('internal-data-network').required(),
      port: Joi.number().integer().min(1).max(65535).required(),
    }),
    Joi.object().keys({
      network: Joi.string().valid('access-network', 'intranet-network').required(),
    }),
  ),
);

export async function validateYaml(yaml: string): Promise<OpenAPI.Document> {
  console.log('--> Validating OpenAPI/Swagger: ' + yaml + '...');
  let api: OpenAPI.Document;
  try {
    api = await SwaggerParser.validate(yaml);
  } catch (error) {
    console.warn('--> Validation failed: ', (<Error>error).message);
    throw new Error('Invalid OpenAPI/Swagger Yaml');
  }
  console.log('--> Valid OpenAPI/Swagger YAML');
  return api;
}

export async function bundleYaml(yaml: string): Promise<OpenAPI.Document> {
  return SwaggerParser.bundle(yaml);
}

export function isSwagger(api: OpenAPI.Document): boolean {
  const oas3 = <OpenAPIV3.Document>api;
  // https://github.com/OAI/OpenAPI-Specification/releases
  if (/^3\.0\.[0,1,2]$/.test(oas3.openapi)) {
    console.log('--> Version: OpenAPI', oas3.openapi);
    return false;
  }
  const swagger = <OpenAPIV2.Document>api;
  if (swagger.swagger === '2.0') {
    console.log('--> Version: Swagger', swagger.swagger);
    return true;
  }

  console.error('--> Yaml is neither OpenAPI 3.x nor Swagger 2.x');
  throw new Error('Invalid OpenAPI/Swagger Version');
}