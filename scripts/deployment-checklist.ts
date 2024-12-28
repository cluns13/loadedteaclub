import fs from 'fs';
import path from 'path';

async function checkDeploymentReadiness() {
  const checks = [
    checkEnvironmentVariables,
    checkBuildConfiguration,
    checkDependencies,
    checkTypeScriptConfiguration
  ];

  const results = await Promise.all(checks.map(check => check()));
  
  const failedChecks = results.filter(result => !result.passed);
  
  if (failedChecks.length > 0) {
    console.error('Deployment Readiness Checks Failed:');
    failedChecks.forEach(check => {
      console.error(`- ${check.message}`);
    });
    process.exit(1);
  }

  console.log('✅ All deployment checks passed successfully!');
}

async function checkEnvironmentVariables(): Promise<{ passed: boolean; message: string }> {
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SITE_URL',
    'GOOGLE_MAPS_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => 
    !process.env[varName] && !fs.existsSync(path.join(process.cwd(), '.env.production'))
  );

  return {
    passed: missingVars.length === 0,
    message: missingVars.length > 0 
      ? `Missing required environment variables: ${missingVars.join(', ')}` 
      : 'Environment variables configured correctly'
  };
}

async function checkBuildConfiguration(): Promise<{ passed: boolean; message: string }> {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

  const missingConfigs = [];
  if (!fs.existsSync(nextConfigPath)) missingConfigs.push('next.config.js');
  if (!fs.existsSync(vercelConfigPath)) missingConfigs.push('vercel.json');

  return {
    passed: missingConfigs.length === 0,
    message: missingConfigs.length > 0
      ? `Missing configuration files: ${missingConfigs.join(', ')}`
      : 'Build configurations are present'
  };
}

async function checkDependencies(): Promise<{ passed: boolean; message: string }> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const missingCriticalDeps = [
      'next', 'react', 'mongodb', 'prisma', 'next-auth'
    ].filter(dep => !packageJson.dependencies[dep]);

    return {
      passed: missingCriticalDeps.length === 0,
      message: missingCriticalDeps.length > 0
        ? `Missing critical dependencies: ${missingCriticalDeps.join(', ')}`
        : 'All critical dependencies are present'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Unable to read package.json'
    };
  }
}

async function checkTypeScriptConfiguration(): Promise<{ passed: boolean; message: string }> {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    return {
      passed: false,
      message: 'TypeScript configuration (tsconfig.json) is missing'
    };
  }

  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    const requiredCompilerOptions = [
      'strict',
      'esModuleInterop',
      'skipLibCheck',
      'forceConsistentCasingInFileNames'
    ];

    const missingOptions = requiredCompilerOptions.filter(
      option => !tsConfig.compilerOptions[option]
    );

    return {
      passed: missingOptions.length === 0,
      message: missingOptions.length > 0
        ? `Missing recommended TypeScript compiler options: ${missingOptions.join(', ')}`
        : 'TypeScript configuration looks good'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Unable to read tsconfig.json'
    };
  }
}

checkDeploymentReadiness();

export default checkDeploymentReadiness;
