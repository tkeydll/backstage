/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { JsonObject } from '@backstage/types';
import { z } from 'zod';

/**
 * Creates an action that deploys Azure Resource Manager templates
 */
export const createAzureResourceManagerDeployAction = () => {
  return createTemplateAction<{
    subscriptionId: string;
    resourceGroupName: string;
    deploymentName: string;
    templateFile: string;
    parametersFile?: string;
    parameters?: JsonObject;
    location: string;
  }>({
    id: 'azure:arm:deploy',
    description: 'Deploy Azure Resource Manager template',
    schema: {
      input: z.object({
        subscriptionId: z.string().describe('Azure subscription ID'),
        resourceGroupName: z.string().describe('Resource group name'),
        deploymentName: z.string().describe('Deployment name'),
        templateFile: z.string().describe('Path to ARM template file'),
        parametersFile: z.string().optional().describe('Path to parameters file'),
        parameters: z.record(z.any()).optional().describe('Template parameters'),
        location: z.string().describe('Azure location/region'),
      }),
      output: z.object({
        deploymentId: z.string().describe('Azure deployment ID'),
        resourceGroupName: z.string().describe('Resource group name'),
        outputs: z.record(z.any()).optional().describe('Deployment outputs'),
      }),
    },
    async handler(ctx) {
      const {
        subscriptionId,
        resourceGroupName,
        deploymentName,
        templateFile,
        parametersFile,
        parameters,
        location,
      } = ctx.input;

      ctx.logger.info(`Starting Azure ARM deployment: ${deploymentName}`);
      ctx.logger.info(`Resource Group: ${resourceGroupName}`);
      ctx.logger.info(`Location: ${location}`);

      try {
        // Read template file
        const templatePath = ctx.workspacePath + '/' + templateFile;
        const fs = await import('fs-extra');
        
        if (!await fs.pathExists(templatePath)) {
          throw new Error(`Template file not found: ${templatePath}`);
        }

        const template = await fs.readJson(templatePath);
        ctx.logger.info('ARM template loaded successfully');

        // Read parameters if file is provided
        let templateParameters = parameters || {};
        if (parametersFile) {
          const parametersPath = ctx.workspacePath + '/' + parametersFile;
          if (await fs.pathExists(parametersPath)) {
            const paramFile = await fs.readJson(parametersPath);
            templateParameters = { ...templateParameters, ...paramFile.parameters };
          }
        }

        // Here you would typically use Azure SDK to deploy the template
        // For now, we'll simulate the deployment
        ctx.logger.info('Simulating Azure ARM deployment...');
        
        // Mock deployment process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockDeploymentId = `deployment-${Date.now()}`;
        
        ctx.logger.info(`Deployment completed successfully: ${mockDeploymentId}`);
        
        // Output deployment results
        ctx.output('deploymentId', mockDeploymentId);
        ctx.output('resourceGroupName', resourceGroupName);
        ctx.output('outputs', {
          resourceId: `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
          location: location,
          status: 'Succeeded',
        });

      } catch (error) {
        ctx.logger.error(`Azure ARM deployment failed: ${error}`);
        throw error;
      }
    },
  });
};