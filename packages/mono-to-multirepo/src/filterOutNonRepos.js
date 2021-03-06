import fs from 'fs-extra';

function filterOutNonRepos(packageFolderNames) {
  return packageFolderNames.reduce((repos, packageFolderName) => {
    try {
      const packageDotJsonContents = fs.readJsonSync(`./packages/${packageFolderName}/package.json`);
      if (packageDotJsonContents && !packageDotJsonContents.privateFromGithub) {
        const repoUrl = (
          packageDotJsonContents.repository && packageDotJsonContents.repository.url
        ) ? packageDotJsonContents.repository.url : null;

        repos.push({
          packageFolderName,
          repoUrl,
        });
      }
    } catch (error) {
      null;
    }
    return repos;
  }, []);
}

export default filterOutNonRepos;
