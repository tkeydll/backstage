# ${{ values.name }}

${{ values.description }}

## Overview

This Azure Web App was created using the Backstage Azure Web App template. It includes:

- Azure App Service Plan (${{ values.appServicePlanTier }} tier)
- Azure Web App
{%- if values.enableApplicationInsights %}
- Application Insights for monitoring and diagnostics
{%- endif %}

## Azure Resources

- **Subscription**: ${{ values.subscriptionId }}
- **Resource Group**: ${{ values.resourceGroupName }}
- **Location**: ${{ values.location }}
- **Web App Name**: ${{ values.name }}
- **App Service Plan**: ${{ values.name }}-plan

## Links

- [Web App URL](https://${{ values.name }}.azurewebsites.net)
- [Azure Portal - Resource Group](https://portal.azure.com/#@/resource/subscriptions/${{ values.subscriptionId }}/resourceGroups/${{ values.resourceGroupName }})
- [Azure Portal - Web App](https://portal.azure.com/#@/resource/subscriptions/${{ values.subscriptionId }}/resourceGroups/${{ values.resourceGroupName }}/providers/Microsoft.Web/sites/${{ values.name }})

## Deployment

This Web App was deployed using Azure Resource Manager (ARM) templates through Backstage. The ARM template includes:

- App Service Plan with the specified pricing tier
- Web App with HTTPS enforcement and TLS 1.2 minimum
- Application Insights (if enabled) for monitoring

## Owner

Owner: ${{ values.owner }}

## Getting Started

1. Configure your deployment pipeline to deploy code to this Web App
2. Set up any required application settings in the Azure Portal
3. Configure custom domain and SSL certificates if needed
4. Monitor your application using Application Insights (if enabled)

## Support

For questions or issues, contact the platform team or the owner listed above.