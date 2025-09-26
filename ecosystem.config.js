module.exports = {
  apps: [
    {
      name: 'imssoftware',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3007',
      cwd: '/clients/apps/imssoftware',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://t-rexinfotech.in/api/imsserver/',
        NEXT_PUBLIC_API_KEY: 'vhdbvsdbvyiedbvhkdbvdibvykvuahabciabcayiicgayibciabcuiaibfyiebcyiaebceibcaibcibcqwibcquibciabciasbcasbciasbcuiabcebciasbcebcebhkas'
      }
    }
  ]
};