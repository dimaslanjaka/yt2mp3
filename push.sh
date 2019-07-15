git config --global github.user dimaslanjaka
git config --global github.token 37b1ce0af59ce0f6dfecaa202eeae4b1728b0e44
git config --global user.email "dimaslanjaka@gmail.com"
git config --global user.name "dimaslanjaka"
git config --global user.signingkey 1DEDA67CD4106FF5
#git config --global credential.helper store
git config --global credential.helper 'cache --timeout=3600'
git remote add origin https://github.com/dimaslanjaka/yt2mp3.git
git config --global gui.encoding utf-8
git remote -v
git add --all
git commit -m "Initial commit"
git push -u origin master