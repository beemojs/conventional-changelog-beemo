import parserOpts from './parserOpts';
import { BumpOptions, SemverLevel } from './types';

const options: BumpOptions = {
  parserOpts,

  whatBump(commits) {
    let level: SemverLevel = 2;
    let breakings = 0;
    let features = 0;

    commits.forEach(commit => {
      if (commit.type === 'break' || commit.type === 'release') {
        breakings += 1;
        level = 0;
      } else if (commit.type === 'new' || commit.type === 'update' || commit.type === 'feature') {
        features += 1;
        if (level === 2) {
          level = 1;
        }
      }
    });

    return {
      level: level,
      reason: `There are ${breakings} breaking changes and ${features} new features`,
    };
  },
};

export default options;
