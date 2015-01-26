set -e;

cd house-of-cards; gulp deploy; cd ..
rsync -rvz parallax perspective-scroll www-data@danielberndt.net:playground

echo "FINISHED"
