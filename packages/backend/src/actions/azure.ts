/*
 * Copyright 2024 The Backstage Authors
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

import fs from 'fs';
import path from 'path';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Azure Resource Manager (ARM) テンプレートをデプロイするScaffolderアクション
 */
export function createAzureResourceManagerDeployAction() {
  return createTemplateAction({
    id: 'azure:arm:deploy',
    description:
      'Azure Resource Manager (ARM) テンプレートをAzureにデプロイします。',
    schema: {
      input: {
        subscriptionId: z =>
          z.string({ description: 'AzureサブスクリプションID' }),
        resourceGroupName: z =>
          z.string({ description: 'デプロイ先のリソースグループ名' }),
        location: z =>
          z.string({ description: 'リソースグループのAzureリージョン' }),
        deploymentName: z =>
          z
            .string({ description: 'デプロイ名（省略時は自動生成）' })
            .optional(),
        template: z =>
          z
            .record(z.any(), {
              description: 'ARMテンプレートのJSONオブジェクト',
            })
            .optional(),
        templateFile: z =>
          z
            .string({ description: 'ワークスペース内のARMテンプレートファイルパス' })
            .optional(),
        parameters: z =>
          z
            .record(z.any(), {
              description:
                'ARMテンプレートのパラメーター（{param: {value: val}} 形式）',
            })
            .optional(),
        parametersFile: z =>
          z
            .string({ description: 'ワークスペース内のパラメーターファイルパス' })
            .optional(),
      },
      output: {
        deploymentName: z =>
          z.string({ description: '実行されたデプロイの名前' }).optional(),
        provisioningState: z =>
          z.string({ description: 'デプロイのプロビジョニング状態' }).optional(),
      },
    },
    async handler(ctx) {
      const {
        subscriptionId,
        resourceGroupName,
        location,
        parameters,
      } = ctx.input;

      // template: オブジェクト直接 or templateFile: ファイルパス
      let template = ctx.input.template;
      if (!template && ctx.input.templateFile) {
        const filePath = path.resolve(ctx.workspacePath, ctx.input.templateFile);
        template = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      if (!template) {
        throw new Error('template または templateFile のいずれかを指定してください');
      }

      // parameters: オブジェクト直接 or parametersFile: ファイルパス
      let resolvedParameters = parameters;
      if (!resolvedParameters && ctx.input.parametersFile) {
        const filePath = path.resolve(ctx.workspacePath, ctx.input.parametersFile);
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // ARM parameters.json の { parameters: { key: { value: val } } } 形式を展開
        resolvedParameters = parsed.parameters ?? parsed;
      }

      const deploymentName =
        ctx.input.deploymentName ??
        `backstage-deploy-${Date.now()}`;

      ctx.logger.info(
        `Azure ARM デプロイを開始します: ${deploymentName} (${resourceGroupName} @ ${location})`,
      );

      const credential = new DefaultAzureCredential();
      const client = new ResourceManagementClient(credential, subscriptionId);

      // リソースグループが存在しない場合は作成
      ctx.logger.info(`リソースグループ "${resourceGroupName}" を確認中...`);
      await client.resourceGroups.createOrUpdate(resourceGroupName, {
        location,
      });
      ctx.logger.info(`リソースグループ "${resourceGroupName}" の準備完了`);

      // ARMテンプレートのデプロイを実行
      ctx.logger.info(`デプロイ "${deploymentName}" を開始中...`);
      const deployment = await client.deployments.beginCreateOrUpdateAndWait(
        resourceGroupName,
        deploymentName,
        {
          properties: {
            mode: 'Incremental',
            template,
            parameters: resolvedParameters ?? {},
          },
        },
      );

      const provisioningState = deployment.properties?.provisioningState;
      ctx.logger.info(
        `デプロイ完了: ${deploymentName} - 状態: ${provisioningState}`,
      );

      ctx.output('deploymentName', deploymentName);
      ctx.output('provisioningState', provisioningState ?? 'Unknown');
    },
  });
}
