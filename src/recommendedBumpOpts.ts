import getTypeGroup from './getTypeGroup';
import parserOpts from './parserOpts';
import { BumpOptions, Group, SemverLevel } from './types';

const options: BumpOptions = {
  parserOpts,

  whatBump(commits) {
    let level: SemverLevel = null;
    let breakings = 0;
    let features = 0;

    commits.forEach((commit) => {
      let group: Group;

      try {
        group = getTypeGroup(commit.type);
      } catch {
        return;
      }

      if (group.bump === 'major') {
        breakings += 1;
        level = 0;
      } else if (group.bump === 'minor') {
        features += 1;
        if (level === null || level === 2) {
          level = 1;
        }
      } else if (group.bump === 'patch') {
        if (level === null) {
          level = 2;
        }
      }
    });

    return {
      level,
      reason: `There are ${breakings} breaking changes and ${features} new features`,
    };
  },
};

export default options;
