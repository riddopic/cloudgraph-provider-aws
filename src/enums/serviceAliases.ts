import services from './services'

export default {
  [services.alb]: 'albs',
  [services.apiGatewayResource]: 'apiGatewayResources',
  [services.apiGatewayRestApi]: 'apiGatewayRestApis',
  [services.apiGatewayStage]: 'apiGatewayStages',
  [services.asg]: 'asgs',
  [services.athenaDataCatalog]: 'athenaDataCatalogs',
  [services.cloud9]: 'cloud9Environments',
  [services.cloudFormationStack]: 'cloudFormationStacks',
  [services.cloudFormationStackSet]: 'cloudFormationStackSets',
  [services.cloudfront]: 'cloudfrontDistributions',
  [services.cloudwatchLog]: 'cloudwatchLogs',
  [services.codebuild]: 'codebuilds',
  [services.configurationRecorder]: 'configurationRecorders',
  [services.dmsReplicationInstance]: 'dmsReplicationInstances',
  [services.ec2Instance]: 'ec2Instances',
  [services.ecsCluster]: 'ecsClusters',
  [services.ecsContainer]: 'ecsContainers',
  [services.ecsService]: 'ecsServices',
  [services.ecsTask]: 'ecsTasks',
  [services.ecsTaskDefinition]: 'ecsTaskDefinitions',
  [services.ecsTaskSet]: 'ecsTaskSets',
  [services.eksCluster]: 'eksClusters',
  [services.elastiCacheCluster]: 'elastiCacheClusters',
  [services.elastiCacheReplicationGroup]: 'elastiCacheReplicationGroups',
  [services.elasticBeanstalkApp]: 'elasticBeanstalkApps',
  [services.elasticBeanstalkEnv]: 'elasticBeanstalkEnvs',
  [services.elasticSearchDomain]: 'elasticSearchDomains',
  [services.elb]: 'elbs',
  [services.emrCluster]: 'emrClusters',
  [services.emrInstance]: 'emrInstances',
  [services.emrStep]: 'emrSteps',
  [services.flowLog]: 'flowLogs',
  [services.glueJob]: 'glueJobs',
  [services.glueRegistry]: 'glueRegistries',
  [services.guardDutyDetector]: 'guardDutyDetectors',
  [services.iamGroup]: 'iamGroups',
  [services.iamOpenIdConnectProvider]: 'iamOpenIdConnectProviders',
  [services.iamPasswordPolicy]: 'iamPasswordPolicies',
  [services.iamPolicy]: 'iamPolicies',
  [services.iamRole]: 'iamRoles',
  [services.iamSamlProvider]: 'iamSamlProviders',
  [services.iamServerCertificate]: 'iamServerCertificates',
  [services.iamUser]: 'iamUsers',
  [services.kinesisStream]: 'kinesisStreams',
  [services.lambda]: 'lambdaFunctions',
  [services.nat]: 'natGateway',
  [services.networkInterface]: 'networkInterfaces',
  [services.organization]: 'organizations',
  [services.rdsCluster]: 'rdsClusters',
  [services.rdsDbInstance]: 'rdsDbInstances',
  [services.redshiftCluster]: 'redshiftClusters',
  [services.route53HostedZone]: 'route53HostedZones',
  [services.route53Record]: 'route53Records',
  [services.routeTable]: 'routeTables',
  [services.sageMakerExperiment]: 'sageMakerExperiments',
  [services.sageMakerNotebookInstance]: 'sageMakerNotebookInstances',
  [services.sageMakerProject]: 'sageMakerProjects',
  [services.secretsManager]: 'secretsManager',
  [services.sg]: 'securityGroups',
  [services.subnet]: 'subnets',
  [services.transitGatewayAttachment]: 'transitGatewayAttachments',
  [services.vpnConnection]: 'vpnConnections',
}
