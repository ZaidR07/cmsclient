module.exports = {
  apps: [
    {
      name: 'cmssoftware',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/clients/apps/cmssoftware',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://t-rexinfotech.in/api/cmsserver/',
        NEXT_PUBLIC_API_KEY: 'vhdbvsdbvyiedbvhkdbvdibvykvuahabciabcayiicgayibciabcuiaibfyiebcyiaebceibcaibcibcqwibcquibciabciasbcasbciasbcuiabcebciasbcebcebhkas'
      }
    }
  ]
};