$(window).ready(function () {
	var structures = [

		// _______

		'......',

		// ok
		//  .((+
		//  \__|
		//   __| 
		//     |
		//   ))
		'...((+))',

		// ok
		//  .((+
		//  \__|
		//   __| 
		//  /  |
		//  .))	
		'..((+))..',

		// ok
		//  (( .+
		//  __|/
		//  __|
		//    |
		//  ))  *
		//      
		'((..+))',

		// ok
		//  ((+
		//  __|
		//  __|
		//    |\
		//  )) . *
		'((+..))',

		// ok
		//   ((+
		//   __|
		//   __|
		//  /  |
		//   *
		//  .))
		'((+))....',

		// ok
		//  (( . +
		//  __|/
		//  __|
		//    |\
		//       *
		//  )) .
		'((..+..))',

		// ok
		//  (( .+((+
		//  _|/ _
		//  _|___
		//   |
		//     *
		//  ))   ))
		//     
		'((..+((+))))',

		// ok
		//  ( ( ((+
		//  _|___
		//  _|_ _
		//   | /
		//     *
		//  ) )+.))
		'((((+))..+))',

		// ok
		//  ( +.((+
		//  _| \_
		//  _|___
		//   |
		//     *
		//  )   ))
		'(+...((+)))',

		// ok
		//  ( ( (+
		//  _|___
		//  _|_ _
		//   | \
		//     *
		//  ) ).+)
		'(((+)+..))',

		//  .(((.
		//  \___
		//   ___)
		//  
		//   )))
		'..(((...)))',

		//   (((.
		//   ___
		//   ___)
		//  /
		//  .)))
		'(((...)))..',


		//  .(((.
		//  \___
		//   ___)
		//  /
		//  .)))
		'..(((...)))..',


	]; 
	var size = 200;

	var structureSel = d3.select("body").selectAll("svg.structure-box")
		.data(structures)
		.enter()
		.append("svg")
		.classed("structure-box",true)
		.style("width",size)
		.style("height",size)

	var chart = StrandPreview().width(size).height(size).loopMode('linear');
	chart(structureSel);
})