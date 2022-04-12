import { fs } from 'mz';
import * as path from 'path';

export function traversePath(base: string, func: (fileName: string) => void): void {
  fs.readdirSync(base).forEach((file) => {
    const fullName = path.join(base, file);
    const fileStat = fs.statSync(fullName);
    if (fileStat.isFile()) {
      func(fullName);
    } else if (fileStat.isDirectory()) {
      traversePath(fullName, func);
    }
  });
}

export function generateFileList(baseDir: string, ext: string = ''): string[] {
  const files: string[] = [];

  traversePath(baseDir, (fileName: string) => {
    let isHit = true;
    if (ext && ext.toLowerCase() !== path.parse(fileName).ext.toLowerCase()) {
      isHit = false;
    }

    if (isHit) {
      files.push(fileName);
    }
  });

  return files;
}