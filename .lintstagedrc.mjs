import path from 'node:path';
import fs from 'node:fs';

export default {
  '**/*.{ts,js,html}': (files) => {
    const relFiles = files.map((f) => path.relative(process.cwd(), f));
    const eslintFiles = relFiles.join(' ');
    
    const commands = [`eslint --fix ${eslintFiles}`];

    // Group staged files by their Nx project (app or lib) and locate the local vite.config
    const projects = new Map();
    
    files.forEach((file) => {
      const relativePath = path.relative(process.cwd(), file);
      const parts = relativePath.split(path.sep);
      
      if (parts.length > 1 && (parts[0] === 'apps' || parts[0] === 'libs')) {
        const projPath = path.join(parts[0], parts[1]);
        const configMts = path.join(projPath, 'vite.config.mts');
        const configTs = path.join(projPath, 'vite.config.ts');
        
        let configPath = null;
        if (fs.existsSync(configMts)) configPath = configMts;
        else if (fs.existsSync(configTs)) configPath = configTs;

        if (configPath) {
          if (!projects.has(configPath)) {
            projects.set(configPath, []);
          }
          projects.get(configPath).push(relativePath);
        }
      }
    });

    // Run vitest related with the project-specific --config flag
    projects.forEach((projFiles, configPath) => {
      const filesList = projFiles.join(' ');
      commands.push(`npx vitest related --run --passWithNoTests --config ${configPath} ${filesList}`);
    });

    return commands;
  },
};