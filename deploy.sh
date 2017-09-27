if git status --porcelain | grep . -qs; then
    echo 'Cannot deploy until changes committed.'
else
    echo 'Repo is clean. Deploy proceeding.'
    commitHash=$(git log --pretty=format:'%h' -n 1)
    branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
    echo "DEPLOYING HASH: $commitHash"
    echo "ORIGINAL BRANCH: $branch"
    # create `deploy` branch if it doesn't exist
    git checkout deploy 2>/dev/null || git checkout -b deploy
    # checkout the branch where you started
    git checkout $branch
    git branch -D deploy-temp1
    git checkout -b deploy-temp1
    # move your commit over to the deploy branch with message referring to the commit's original hash
    git reset deploy
    # collect all the deps in all nested folders, and use to create master deps list for package.json
    # necessary because deploy bundle has external references to node_modules contents
    ./packages/npm-deps/bin/npm-deps < package.json > package-combined.json --silent
    node ./packages/npm-deps/transfer-deps.js ./package-combined.json ./package.json
    # compile the bundle
    echo "BUNDLING: $branch"
    ./packages/dev_env/bin/devenv.js --servers='bernieserver,junk-express' --isDev=false --isUniversal=true --isDeploy=true
    git add -A .
    git commit -m "deployed $commitHash"
    git checkout deploy
    git rebase deploy-temp1
    git branch -D deploy-temp1
    git push -u origin deploy
    git checkout $branch
    echo "DONE DEPLOYING, RETURNING TO BRANCH: $branch"
fi