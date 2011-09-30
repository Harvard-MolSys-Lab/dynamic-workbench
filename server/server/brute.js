exports.start = function(req, res) {
	var node = req.param('node'), strands = req.param('strands'), length = req.param('length'), fullPath = utils.userFilePath(node), cmd;
	//console.log(strands);
	if(!allowedPath(node) || !allowedPath(fullPath)) {
		forbidden(res);
		console.log("Can't enter path: '" + fullPath + "'");
	}

	function brute(strands, length) {

		var designer = new DD(); nMers = permutations(length), nMerIndex = 0;
		designer.addDomains(strands);
		nMerIndex = designer.getDomainCount();

		return scores = _.reduce(nMers, function(memo, nMer) {
			designer.addDomains([nMer]);
			// true to force recalculation of scores
			memo[nMer] = designer.getScore(nMerIndex, true)
			designer.popDomain();
			return memo;
		}, {});

	}

	nupackAnalysis(strands, path.basename(fullPath), path.dirname(fullPath), {
		maxComplexSize : 2
	}, function(err, out) {
		if(err) {
			console.log(err);
			sendError(res, 'Internal Server Error', 500);
			return;
		}

		if(!!out.stderr) {
			res.send(out.stderr);
			return;
		}
		res.send(out.stdout);

	});
	/*
	 // var node = req.param('node'),
	 // strands = req.param('strands'),
	 // maxComplex = req.param('max'),
	 // cmd,
	 // strandList = _.compact(strands),//_.compact(strands.split('\n'));
	 // combs = combinations(strandList),
	 // combsLabels = combinations(_.range(1,strandList.length+1));
	 // fullPath = path.dirname(path.resolve(utils.userFilePath(node)));
	 //
	 // var tasks = [];
	 // _.each(combs, function(comb,index) {
	 // console.log([comb,'combination-'+combsLabels[index].join(','),fullPath].join(';'));
	 // tasks.push(_.bind(pairwise, {},comb,'combination-'+combsLabels[index].join(','),fullPath));
	 // });
	 // async.serial(tasks, function(err,results) {
	 // res.send(results);
	 // })
	 // nupackAnalysis(strandList,path.basename(fullPath),path.dirname(fullPath), {maxComplexSize:2}, function(out) {
	 // if(out.err) {
	 // console.log(out.err);
	 // }
	 //
	 // if(!!out.stderr) {
	 // res.send(out.stderr);
	 // return;
	 // }
	 // res.send(out.stdout);
	 //
	 // });
	 */
};
