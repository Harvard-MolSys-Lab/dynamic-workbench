
TOOLSPATH=/home/webserver-user/app/tools

# multisubjective
echo 'Building multisubjective...'
cd $TOOLSPATH/multisubjective
make clean
make
chmod a+x ./multisubjective
echo 'Finished building multisubjective.'

# NUPACK
echo 'Building NUPACK...'
cd $TOOLSPATH/nupack3
make clean
make all
chmod a+x ./bin/*
echo 'Finished building NUPACK. '
